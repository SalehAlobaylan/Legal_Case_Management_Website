"use client";

import React, { useState } from "react";
import { useClientActivities, useCreateClientActivity } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Phone, Mail, Users, Settings, FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Props {
  clientId: number;
}

export function ClientActivityTimeline({ clientId }: Props) {
  const { t, isRTL } = useI18n();
  const { data: activities, isLoading } = useClientActivities(clientId);
  const { mutate: createActivity, isPending } = useCreateClientActivity();
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"note" | "call" | "email" | "meeting" | "system">("note");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!description.trim()) return;
    createActivity({ id: clientId, input: { type, description } }, {
      onSuccess: () => {
        setDescription("");
        setIsAdding(false);
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="w-4 h-4 text-blue-600" />;
      case "email": return <Mail className="w-4 h-4 text-emerald-600" />;
      case "meeting": return <Users className="w-4 h-4 text-purple-600" />;
      case "system": return <Settings className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "call": return "bg-blue-100 border-blue-200";
      case "email": return "bg-emerald-100 border-emerald-200";
      case "meeting": return "bg-purple-100 border-purple-200";
      case "system": return "bg-amber-100 border-amber-200";
      default: return "bg-slate-100 border-slate-200";
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#D97706]" /></div>;

  return (
    <div className="space-y-6">
      {/* Add New Activity */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-slate-500 font-medium text-sm flex items-center gap-2 hover:text-[#D97706] transition-colors"
          >
            <Plus className="w-4 h-4" /> {t("clients.activity.addNote")}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {(["note", "call", "email", "meeting"] as const).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setType(tKey)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all",
                    type === tKey 
                      ? "bg-[#D97706] text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {t(`clients.activity.${tKey}`)}
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("clients.activity.placeholder")}
              className="w-full text-sm p-3 border border-slate-200 rounded-lg min-h-[100px] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/50"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>{t("clients.activity.cancel")}</Button>
              <Button onClick={handleAdd} disabled={isPending || !description.trim()} className="bg-[#D97706] hover:bg-[#B45309]">
                {isPending ? t("clients.activity.saving") : t("clients.activity.saveActivity")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent pt-2">
        {activities?.map((activity) => (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
              isRTL ? "ml-[15px] md:ml-[calc(50%-1.25rem)]" : "mr-[15px] md:mr-0 md:group-odd:-ml-[1.25rem] md:group-even:-mr-[1.25rem]",
              getIconBg(activity.type),
              "absolute left-0 md:left-1/2 z-10 -translate-x-[50%]"
            )}>
              {getIcon(activity.type)}
            </div>
            
            <div className="w-full md:w-[calc(50%-2.5rem)] bg-white ml-8 md:ml-0 p-4 rounded-xl border border-slate-100 shadow-sm relative">
              {/* Arrow */}
              <div className="absolute top-5 -left-2 md:hidden w-3 h-3 bg-white border-l border-b border-slate-100 rotate-45"></div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-slate-800 text-sm capitalize">{t(`clients.activity.${activity.type}`)}</span>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    {t("clients.activity.by")} {activity.user?.fullName || t("clients.activity.system")} • {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
            </div>
          </div>
        ))}
        {(!activities || activities.length === 0) && (
          <div className="text-center text-slate-500 py-8 text-sm">{t("clients.activity.noActivities")}</div>
        )}
      </div>
    </div>
  );
}
