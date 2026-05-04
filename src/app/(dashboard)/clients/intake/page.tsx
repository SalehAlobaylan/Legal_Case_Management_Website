"use client";

import * as React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import {
  useIntakeForms,
  useCreateIntakeForm,
  useUpdateIntakeForm,
  useDeleteIntakeForm,
} from "@/lib/hooks/use-intake";
import type {
  IntakeField,
  IntakeForm,
  IntakeFormLogicRule,
  IntakeFormSchema,
  IntakeFormTheme,
} from "@/lib/api/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Settings,
  BarChart3,
  FileText,
  Eye,
  Copy,
  Trash2,
  Save,
  ArrowLeft,
  Inbox,
  CopyPlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableField } from "@/components/features/forms/sortable-field";
import { FormRenderer } from "@/components/features/forms/form-renderer";
import { FieldOptionsEditor } from "@/components/features/forms/field-options-editor";
import { LogicRuleEditor } from "@/components/features/forms/logic-rule-editor";
import { SubmissionsTab } from "./_components/submissions-tab";
import { AnalyticsTab } from "./_components/analytics-tab";

type FieldType = IntakeField["type"];

const FIELD_TYPES: { value: FieldType; labelEn: string; labelAr: string }[] = [
  { value: "text", labelEn: "Text", labelAr: "نص" },
  { value: "textarea", labelEn: "Text Area", labelAr: "وصف" },
  { value: "email", labelEn: "Email", labelAr: "بريد إلكتروني" },
  { value: "phone", labelEn: "Phone", labelAr: "هاتف" },
  { value: "select", labelEn: "Dropdown", labelAr: "قائمة منسدلة" },
  { value: "checkbox", labelEn: "Checkbox", labelAr: "خانة اختيار" },
  { value: "radio", labelEn: "Radio", labelAr: "أزرار اختيار" },
  { value: "date", labelEn: "Date", labelAr: "تاريخ" },
];

const FIELDS_WITH_OPTIONS: FieldType[] = ["select", "radio", "checkbox"];

const DEFAULT_THEME: IntakeFormTheme = {
  primaryColor: "#D97706",
  borderRadius: 12,
  layoutDensity: "comfortable",
};

type EditingForm = {
  id?: number;
  title: string;
  description: string;
  isActive: boolean;
  fields: IntakeField[];
  theme: IntakeFormTheme;
  logicRules: IntakeFormLogicRule[];
};

const presetFor = (
  preset: "client" | "case" | "general" | "blank",
  locale: "ar" | "en"
): IntakeField[] => {
  const isAr = locale === "ar";
  if (preset === "client") {
    return [
      { id: "name", label: isAr ? "الاسم الكامل" : "Full Name", type: "text", required: true },
      { id: "email", label: isAr ? "البريد الإلكتروني" : "Email", type: "email" },
      { id: "phone", label: isAr ? "رقم الهاتف" : "Phone Number", type: "phone", required: true },
      {
        id: "type",
        label: isAr ? "نوع العميل" : "Client Type",
        type: "select",
        options: [
          { value: "individual", label: isAr ? "فردي" : "Individual" },
          { value: "corporate", label: isAr ? "شركة" : "Corporate" },
          { value: "sme", label: isAr ? "صغير ومتوسط" : "SME" },
        ],
      },
      { id: "notes", label: isAr ? "ملاحظات" : "Notes", type: "textarea" },
    ];
  }
  if (preset === "case") {
    return [
      { id: "name", label: isAr ? "اسم العميل" : "Client Name", type: "text", required: true },
      { id: "email", label: isAr ? "البريد الإلكتروني" : "Email", type: "email" },
      { id: "phone", label: isAr ? "الهاتف" : "Phone", type: "phone", required: true },
      {
        id: "case_type",
        label: isAr ? "نوع القضية" : "Case Type",
        type: "select",
        required: true,
        options: [
          { value: "labor", label: isAr ? "عمالي" : "Labor" },
          { value: "commercial", label: isAr ? "تجاري" : "Commercial" },
          { value: "civil", label: isAr ? "مدني" : "Civil" },
          { value: "criminal", label: isAr ? "جنائي" : "Criminal" },
        ],
      },
      {
        id: "case_description",
        label: isAr ? "وصف القضية" : "Case Description",
        type: "textarea",
        required: true,
      },
      {
        id: "priority",
        label: isAr ? "الأولوية" : "Priority",
        type: "select",
        options: [
          { value: "low", label: isAr ? "منخفضة" : "Low" },
          { value: "medium", label: isAr ? "متوسطة" : "Medium" },
          { value: "high", label: isAr ? "عالية" : "High" },
        ],
      },
    ];
  }
  if (preset === "general") {
    return [
      { id: "name", label: isAr ? "الاسم" : "Name", type: "text", required: true },
      { id: "email", label: isAr ? "البريد الإلكتروني" : "Email", type: "email" },
      { id: "notes", label: isAr ? "الرسالة" : "Message", type: "textarea" },
    ];
  }
  return [];
};

const newFieldId = () =>
  `field_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;

export default function ClientIntakePage() {
  const { data: forms = [], isLoading } = useIntakeForms();
  const createForm = useCreateIntakeForm();
  const updateForm = useUpdateIntakeForm();
  const deleteForm = useDeleteIntakeForm();
  const { locale, isRTL } = useI18n();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const [activeTab, setActiveTab] = React.useState<
    "forms" | "builder" | "submissions" | "analytics"
  >("forms");
  const [editing, setEditing] = React.useState<EditingForm | null>(null);
  const [deleteCandidate, setDeleteCandidate] = React.useState<IntakeForm | null>(null);
  const [previewValues, setPreviewValues] = React.useState<Record<string, unknown>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const startNewForm = React.useCallback(
    (preset: "client" | "case" | "general" | "blank") => {
      setEditing({
        id: undefined,
        title:
          preset === "blank"
            ? locale === "ar"
              ? "نموذج جديد"
              : "New Form"
            : presetTitle(preset, locale),
        description: "",
        isActive: true,
        fields: presetFor(preset, locale),
        theme: { ...DEFAULT_THEME },
        logicRules: [],
      });
      setPreviewValues({});
      setActiveTab("builder");
    },
    [locale]
  );

  const openExistingForm = (form: IntakeForm) => {
    setEditing({
      id: form.id,
      title: form.title,
      description: form.description ?? "",
      isActive: form.isActive,
      fields: form.fieldsJson || [],
      theme: form.schema?.theme ?? { ...DEFAULT_THEME },
      logicRules: form.schema?.logicRules ?? [],
    });
    setPreviewValues({});
    setActiveTab("builder");
  };

  const cloneForm = (form: IntakeForm) => {
    setEditing({
      id: undefined,
      title: `${form.title} ${locale === "ar" ? "(نسخة)" : "(copy)"}`,
      description: form.description ?? "",
      isActive: true,
      fields: form.fieldsJson || [],
      theme: form.schema?.theme ?? { ...DEFAULT_THEME },
      logicRules: form.schema?.logicRules ?? [],
    });
    setPreviewValues({});
    setActiveTab("builder");
  };

  const updateEditing = (patch: Partial<EditingForm>) =>
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));

  const addField = () => {
    if (!editing) return;
    const newField: IntakeField = {
      id: newFieldId(),
      label: locale === "ar" ? "حقل جديد" : "New Field",
      type: "text",
      required: false,
    };
    updateEditing({ fields: [...editing.fields, newField] });
  };

  const updateField = (id: string, patch: Partial<IntakeField>) => {
    if (!editing) return;
    updateEditing({
      fields: editing.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  };

  const removeField = (id: string) => {
    if (!editing) return;
    updateEditing({
      fields: editing.fields.filter((f) => f.id !== id),
      logicRules: editing.logicRules
        .map((r) => ({
          ...r,
          conditions: r.conditions.filter((c) => c.fieldId !== id),
          targetFieldIds: r.targetFieldIds.filter((t) => t !== id),
        }))
        .filter((r) => r.conditions.length > 0 && r.targetFieldIds.length > 0),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !editing) return;
    const oldIndex = editing.fields.findIndex((f) => f.id === active.id);
    const newIndex = editing.fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    updateEditing({ fields: arrayMove(editing.fields, oldIndex, newIndex) });
  };

  const buildPayload = (e: EditingForm) => {
    const fieldsJson = e.fields.map((f) => ({
      id: f.id,
      label: f.label.trim(),
      type: f.type,
      required: !!f.required,
      placeholder: f.placeholder,
      options: FIELDS_WITH_OPTIONS.includes(f.type) ? f.options || [] : undefined,
    }));
    const schema: IntakeFormSchema = {
      sections: [
        {
          id: "main",
          titleEn: "Main",
          titleAr: "رئيسي",
          layout: "single",
          order: 0,
          fieldIds: fieldsJson.map((f) => f.id),
        },
      ],
      logicRules: e.logicRules,
      theme: e.theme,
    };
    return {
      title: e.title.trim(),
      description: e.description.trim() || null,
      isActive: e.isActive,
      fieldsJson,
      schema,
    };
  };

  const validateBeforeSave = (e: EditingForm): string | null => {
    if (!e.title.trim()) return isRTL ? "العنوان مطلوب" : "Title is required";
    if (e.fields.length === 0)
      return isRTL ? "أضف حقلاً واحداً على الأقل" : "Add at least one field";
    if (e.fields.some((f) => !f.label.trim()))
      return isRTL ? "كل الحقول يجب أن تحتوي تسمية" : "Every field needs a label";
    const ids = new Set<string>();
    for (const f of e.fields) {
      if (ids.has(f.id))
        return isRTL ? "هناك حقول بمعرف مكرر" : "Duplicate field IDs";
      ids.add(f.id);
      if (FIELDS_WITH_OPTIONS.includes(f.type) && (!f.options || f.options.length === 0))
        return isRTL
          ? `أضف خيارات للحقل: ${f.label}`
          : `Add options to field: ${f.label}`;
    }
    return null;
  };

  const handleSave = () => {
    if (!editing) return;
    const error = validateBeforeSave(editing);
    if (error) {
      toast({ title: error, variant: "destructive" });
      return;
    }
    const payload = buildPayload(editing);
    const onSuccess = (msg: string) => {
      toast({ title: msg, variant: "success" });
      setEditing(null);
      setActiveTab("forms");
    };
    const onError = () =>
      toast({
        title: isRTL ? "فشل الحفظ" : "Failed to save form",
        variant: "destructive",
      });

    if (editing.id) {
      updateForm.mutate(
        { id: editing.id, input: payload },
        {
          onSuccess: () => onSuccess(isRTL ? "تم تحديث النموذج" : "Form updated"),
          onError,
        }
      );
    } else {
      createForm.mutate(payload, {
        onSuccess: () => onSuccess(isRTL ? "تم إنشاء النموذج" : "Form created"),
        onError,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    deleteForm.mutate(deleteCandidate.id, {
      onSuccess: () => {
        toast({ title: isRTL ? "تم حذف النموذج" : "Form deleted", variant: "success" });
        setDeleteCandidate(null);
      },
      onError: () => {
        toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
      },
    });
  };

  const shareLinkFor = (id: number) => `${origin}/intake/${id}?lang=${locale}`;
  const embedFor = (id: number) =>
    `<iframe src="${shareLinkFor(id)}" width="100%" height="700" frameborder="0"></iframe>`;

  const isSaving = createForm.isPending || updateForm.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            {isRTL ? "منصة النماذج" : "Forms Platform"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRTL
              ? "أنشئ، شارك، وحلّل نماذج الاستقبال والقضايا والمراسلات"
              : "Create, share, and analyze intake, case, and outreach forms"}
          </p>
        </div>
        {activeTab !== "builder" && (
          <Button
            className="bg-[#D97706] hover:bg-[#B45309]"
            onClick={() => startNewForm("blank")}
          >
            <Plus className="h-4 w-4" />
            <span className="ms-1">{isRTL ? "نموذج جديد" : "New Form"}</span>
          </Button>
        )}
      </div>

      <Tabs
        defaultValue="forms"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {isRTL ? "النماذج" : "Forms"}
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isRTL ? "المنشئ" : "Builder"}
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            {isRTL ? "الواردة" : "Submissions"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {isRTL ? "التحليلات" : "Analytics"}
          </TabsTrigger>
        </TabsList>

        {/* FORMS LIST */}
        <TabsContent value="forms" className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              {isRTL ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : forms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <EmptyState
                icon={FileText}
                title={isRTL ? "لا توجد نماذج بعد" : "No forms yet"}
                description={
                  isRTL
                    ? "أنشئ نموذجك الأول لتبدأ في جمع المعلومات من العملاء"
                    : "Create your first form to start collecting information from clients"
                }
                action={{
                  label: isRTL ? "نموذج جديد" : "New Form",
                  onClick: () => startNewForm("client"),
                }}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <PresetCard
                  title={isRTL ? "استقبال عميل" : "Client Intake"}
                  description={isRTL ? "تأهيل العملاء الجدد" : "New client qualification"}
                  onClick={() => startNewForm("client")}
                />
                <PresetCard
                  title={isRTL ? "استقبال قضية" : "Case Intake"}
                  description={isRTL ? "جمع معلومات القضية" : "Case intake information"}
                  onClick={() => startNewForm("case")}
                />
                <PresetCard
                  title={isRTL ? "نموذج عام" : "General"}
                  description={isRTL ? "نموذج تواصل عام" : "Generic contact form"}
                  onClick={() => startNewForm("general")}
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {forms.map((form) => {
                  const link = shareLinkFor(form.id);
                  return (
                    <div
                      key={form.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#0F2942] truncate">{form.title}</p>
                          <Badge
                            variant={form.isActive ? "success" : "default"}
                            className="text-xs"
                          >
                            {form.isActive
                              ? isRTL
                                ? "نشط"
                                : "Active"
                              : isRTL
                                ? "غير نشط"
                                : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {(form.fieldsJson || []).length}{" "}
                          {isRTL ? "حقل" : "fields"} · {link}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => openExistingForm(form)}>
                          <Settings className="h-4 w-4" />
                          <span className="ms-1">{isRTL ? "تعديل" : "Edit"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(link);
                            toast({
                              title: isRTL ? "تم نسخ الرابط" : "Link copied",
                              variant: "success",
                            });
                          }}
                          aria-label={isRTL ? "نسخ الرابط" : "Copy link"}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="ms-1">{isRTL ? "نسخ" : "Copy"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(embedFor(form.id));
                            toast({
                              title: isRTL ? "تم نسخ كود التضمين" : "Embed code copied",
                              variant: "success",
                            });
                          }}
                        >
                          <span className="text-xs">&lt;/&gt;</span>
                          <span className="ms-1">{isRTL ? "تضمين" : "Embed"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="ms-1">{isRTL ? "معاينة" : "Preview"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cloneForm(form)}
                          aria-label={isRTL ? "نسخ النموذج" : "Duplicate form"}
                        >
                          <CopyPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteCandidate(form)}
                          aria-label={isRTL ? "حذف النموذج" : "Delete form"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* BUILDER */}
        <TabsContent value="builder" className="space-y-4">
          {!editing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <EmptyState
                icon={Settings}
                title={isRTL ? "لا يوجد نموذج مفتوح" : "No form open"}
                description={
                  isRTL
                    ? "اختر نموذجاً من قائمة النماذج، أو أنشئ نموذجاً جديداً"
                    : "Pick a form from the list, or start a new one"
                }
                action={{
                  label: isRTL ? "نموذج جديد" : "New Form",
                  onClick: () => startNewForm("blank"),
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(null);
                      setActiveTab("forms");
                    }}
                    aria-label={isRTL ? "رجوع" : "Back"}
                  >
                    <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
                  </Button>
                  <Input
                    value={editing.title}
                    onChange={(e) => updateEditing({ title: e.target.value })}
                    className="text-xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0 max-w-md"
                    placeholder={isRTL ? "اسم النموذج..." : "Form name..."}
                    aria-label={isRTL ? "اسم النموذج" : "Form name"}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={editing.isActive}
                      onChange={(e) => updateEditing({ isActive: e.target.checked })}
                      className="accent-[#D97706]"
                    />
                    {isRTL ? "نشط" : "Active"}
                  </label>
                  <Button variant="outline" onClick={() => { setEditing(null); setActiveTab("forms"); }}>
                    {isRTL ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    className="bg-[#D97706] hover:bg-[#B45309]"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4" />
                    <span className="ms-1">
                      {isSaving
                        ? isRTL
                          ? "جارٍ الحفظ..."
                          : "Saving..."
                        : isRTL
                          ? "حفظ"
                          : "Save"}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: editor */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="form-description">
                      {isRTL ? "الوصف (اختياري)" : "Description (optional)"}
                    </Label>
                    <textarea
                      id="form-description"
                      value={editing.description}
                      onChange={(e) => updateEditing({ description: e.target.value })}
                      placeholder={
                        isRTL
                          ? "نص يظهر للعميل أعلى النموذج"
                          : "Shown to the user above the form"
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-h-16 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[#0F2942]">
                        {isRTL ? "الحقول" : "Fields"}
                      </h4>
                      <Button variant="outline" size="sm" onClick={addField}>
                        <Plus className="h-4 w-4" />
                        <span className="ms-1">{isRTL ? "إضافة حقل" : "Add Field"}</span>
                      </Button>
                    </div>

                    {editing.fields.length === 0 ? (
                      <p className="text-center text-slate-400 py-8 text-sm">
                        {isRTL ? "لا توجد حقول. اضغط 'إضافة حقل'." : "No fields yet. Click 'Add Field'."}
                      </p>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={editing.fields.map((f) => f.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {editing.fields.map((field) => (
                              <SortableField key={field.id} id={field.id} isRTL={isRTL}>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-12 gap-2">
                                    <Input
                                      value={field.label}
                                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                                      placeholder={isRTL ? "تسمية الحقل" : "Field label"}
                                      className="col-span-12 md:col-span-5 h-9 bg-white"
                                      aria-label={isRTL ? "تسمية الحقل" : "Field label"}
                                    />
                                    <Select
                                      value={field.type}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          type: e.target.value as FieldType,
                                          options: FIELDS_WITH_OPTIONS.includes(
                                            e.target.value as FieldType
                                          )
                                            ? field.options || []
                                            : undefined,
                                        })
                                      }
                                      className="col-span-7 md:col-span-3 h-9 bg-white"
                                      aria-label={isRTL ? "نوع الحقل" : "Field type"}
                                    >
                                      {FIELD_TYPES.map((ft) => (
                                        <option key={ft.value} value={ft.value}>
                                          {locale === "ar" ? ft.labelAr : ft.labelEn}
                                        </option>
                                      ))}
                                    </Select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateField(field.id, { required: !field.required })
                                      }
                                      className={cn(
                                        "col-span-3 md:col-span-3 h-9 rounded-lg border text-xs font-bold",
                                        field.required
                                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                          : "bg-white text-slate-600 border-slate-200"
                                      )}
                                      aria-pressed={!!field.required}
                                    >
                                      {field.required
                                        ? isRTL
                                          ? "إلزامي"
                                          : "Required"
                                        : isRTL
                                          ? "اختياري"
                                          : "Optional"}
                                    </button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="col-span-2 md:col-span-1 h-9 text-red-500 hover:bg-red-50"
                                      onClick={() => removeField(field.id)}
                                      aria-label={isRTL ? "حذف الحقل" : "Delete field"}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {FIELDS_WITH_OPTIONS.includes(field.type) && (
                                    <FieldOptionsEditor
                                      options={field.options || []}
                                      onChange={(options) => updateField(field.id, { options })}
                                      isRTL={isRTL}
                                    />
                                  )}
                                </div>
                              </SortableField>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-[#0F2942] mb-3">
                      {isRTL ? "الشروط (Logic)" : "Logic Rules"}
                    </h4>
                    <LogicRuleEditor
                      rules={editing.logicRules}
                      fields={editing.fields}
                      onChange={(logicRules) => updateEditing({ logicRules })}
                      isRTL={isRTL}
                    />
                  </div>
                </div>

                {/* RIGHT: preview + theme */}
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                    <h4 className="font-bold text-[#0F2942]">{isRTL ? "المظهر" : "Appearance"}</h4>
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">
                        {isRTL ? "اللون الأساسي" : "Primary Color"}
                      </Label>
                      <div className="flex gap-2">
                        <input
                          id="primary-color"
                          type="color"
                          value={editing.theme.primaryColor}
                          onChange={(e) =>
                            updateEditing({
                              theme: { ...editing.theme, primaryColor: e.target.value },
                            })
                          }
                          className="h-10 w-12 rounded cursor-pointer"
                          aria-label={isRTL ? "اختر اللون" : "Pick color"}
                        />
                        <Input
                          value={editing.theme.primaryColor}
                          onChange={(e) =>
                            updateEditing({
                              theme: { ...editing.theme, primaryColor: e.target.value },
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">
                        {isRTL ? "نصف قطر الحدود" : "Border Radius"}
                      </Label>
                      <Input
                        id="border-radius"
                        type="number"
                        min={0}
                        max={32}
                        value={editing.theme.borderRadius}
                        onChange={(e) =>
                          updateEditing({
                            theme: { ...editing.theme, borderRadius: Number(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="density">{isRTL ? "الكثافة" : "Density"}</Label>
                      <Select
                        id="density"
                        value={editing.theme.layoutDensity}
                        onChange={(e) =>
                          updateEditing({
                            theme: {
                              ...editing.theme,
                              layoutDensity: e.target.value as IntakeFormTheme["layoutDensity"],
                            },
                          })
                        }
                      >
                        <option value="comfortable">{isRTL ? "مريح" : "Comfortable"}</option>
                        <option value="compact">{isRTL ? "مكتظ" : "Compact"}</option>
                        <option value="spacious">{isRTL ? "واسع" : "Spacious"}</option>
                      </Select>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <h4 className="font-bold text-[#0F2942] mb-3">
                      {isRTL ? "معاينة مباشرة" : "Live Preview"}
                    </h4>
                    {editing.fields.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">
                        {isRTL ? "أضف حقولاً لرؤية المعاينة" : "Add fields to see the preview"}
                      </p>
                    ) : (
                      <FormRenderer
                        fields={editing.fields}
                        logicRules={editing.logicRules}
                        values={previewValues}
                        onChange={setPreviewValues}
                        isRTL={isRTL}
                        primaryColor={editing.theme.primaryColor}
                        density={editing.theme.layoutDensity}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteCandidate}
        onOpenChange={(o) => !o && setDeleteCandidate(null)}
        title={isRTL ? "حذف النموذج" : "Delete form"}
        description={
          deleteCandidate
            ? isRTL
              ? `سيتم تعطيل النموذج "${deleteCandidate.title}". التقديمات السابقة ستبقى محفوظة.`
              : `The form "${deleteCandidate.title}" will be deactivated. Past submissions are preserved.`
            : ""
        }
        confirmText={isRTL ? "حذف" : "Delete"}
        cancelText={isRTL ? "إلغاء" : "Cancel"}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}

function presetTitle(preset: "client" | "case" | "general", locale: "ar" | "en") {
  const isAr = locale === "ar";
  if (preset === "client") return isAr ? "نموذج استقبال عميل" : "Client Intake Form";
  if (preset === "case") return isAr ? "نموذج استقبال قضية" : "Case Intake Form";
  return isAr ? "نموذج تواصل" : "Contact Form";
}

function PresetCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-start bg-white border border-slate-200 rounded-2xl p-4 hover:border-amber-300 hover:bg-amber-50/40 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <p className="font-semibold text-[#0F2942]">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-2">
        <Plus className="h-3 w-3" />
        Start
      </span>
    </button>
  );
}
