/**
 * File: src/components/features/admin/announcements/announcements-admin-card.tsx
 * Purpose: Admin org-wide announcements card — post, list, retire/activate,
 *          and delete. Extracted from src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import { Loader2, Megaphone, Send, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/hooks/use-i18n";
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "@/lib/hooks/use-announcements";
import type {
  AnnouncementSeverity,
  OrgAnnouncement,
} from "@/lib/api/announcements";

export function AnnouncementsAdminCard() {
  const { t } = useI18n();
  const { data: announcements, isLoading } = useAdminAnnouncements();
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const remove = useDeleteAnnouncement();

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [severity, setSeverity] = React.useState<AnnouncementSeverity>("info");
  const [confirm, setConfirm] = React.useState<{
    type: "delete" | "retire" | "activate";
    announcement: OrgAnnouncement;
  } | null>(null);

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    create.mutate(
      { title: title.trim(), body: body.trim(), severity },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setSeverity("info");
        },
      }
    );
  };

  const severityTone: Record<AnnouncementSeverity, string> = {
    info: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-800",
    important: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-4 w-4" /> {t("admin.announcementsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New announcement form */}
        <div className="space-y-2">
          <Label htmlFor="ann-title" className="text-xs">
            {t("admin.announcementsNew")}
          </Label>
          <Input
            id="ann-title"
            placeholder={t("admin.announcementsTitlePlaceholder") || "Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <Textarea
            placeholder={t("admin.announcementsBodyPlaceholder") || "Message"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
          />
          <div className="flex items-center gap-2">
            <Select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as AnnouncementSeverity)}
              className="w-40 h-9 text-sm"
            >
              <option value="info">{t("admin.severityInfo")}</option>
              <option value="warning">{t("admin.severityWarning")}</option>
              <option value="important">{t("admin.severityImportant")}</option>
            </Select>
            <Button
              onClick={submit}
              disabled={!title.trim() || !body.trim() || create.isPending}
              className="bg-[#0F2942] hover:bg-[#1E3A56]"
            >
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ms-2">{t("settings.saveChanges") || "Post"}</span>
            </Button>
          </div>
        </div>

        {/* List */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">
            {(announcements?.length ?? 0)} {t("admin.totalLabel")}
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : !announcements || announcements.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t("admin.announcementsNoneActive")}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <AnnouncementRow
                  key={a.id}
                  a={a}
                  toneClass={severityTone[a.severity]}
                  onRetire={() => setConfirm({ type: "retire", announcement: a })}
                  onActivate={() => setConfirm({ type: "activate", announcement: a })}
                  onDelete={() => setConfirm({ type: "delete", announcement: a })}
                  busy={update.isPending || remove.isPending}
                />
              ))}
            </ul>
          )}
        </div>
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={
            confirm?.type === "delete"
              ? t("admin.confirmDeleteAnnouncementTitle")
              : confirm?.type === "retire"
                ? t("admin.confirmRetireAnnouncementTitle")
                : t("admin.confirmActivateAnnouncementTitle")
          }
          description={(confirm?.type === "delete"
            ? t("admin.confirmDeleteAnnouncementDesc")
            : confirm?.type === "retire"
              ? t("admin.confirmRetireAnnouncementDesc")
              : t("admin.confirmActivateAnnouncementDesc")
          ).replace("{{title}}", confirm?.announcement.title ?? "")}
          confirmText={
            confirm?.type === "delete"
              ? t("common.delete")
              : confirm?.type === "retire"
                ? t("admin.announcementsRetire")
                : t("admin.announcementsActive")
          }
          cancelText={t("common.cancel")}
          variant={confirm?.type === "delete" ? "danger" : "warning"}
          onConfirm={() => {
            if (!confirm) return;
            if (confirm.type === "delete") remove.mutate(confirm.announcement.id);
            if (confirm.type === "retire") {
              update.mutate({
                id: confirm.announcement.id,
                patch: { isActive: false },
              });
            }
            if (confirm.type === "activate") {
              update.mutate({
                id: confirm.announcement.id,
                patch: { isActive: true },
              });
            }
            setConfirm(null);
          }}
        />
      </CardContent>
    </Card>
  );
}

function AnnouncementRow({
  a,
  toneClass,
  onRetire,
  onActivate,
  onDelete,
  busy,
}: {
  a: OrgAnnouncement;
  toneClass: string;
  onRetire: () => void;
  onActivate: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const { t } = useI18n();
  return (
    <li className="py-2 flex items-start justify-between gap-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${toneClass}`}
          >
            {a.severity}
          </span>
          {!a.isActive && (
            <Badge variant="outline" className="text-[10px]">
              {t("admin.announcementsRetired")}
            </Badge>
          )}
          <div className="font-medium text-[#0F2942] truncate">{a.title}</div>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {a.isActive ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={onRetire}
            title={t("admin.announcementsRetire")}
          >
            {t("admin.announcementsRetire")}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={onActivate}
          >
            {t("admin.announcementsActive")}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          disabled={busy}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}
