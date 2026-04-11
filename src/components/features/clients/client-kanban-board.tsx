"use client";

import React, { useState } from "react";
import { useUpdateClient } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { Client, ClientLeadStatus } from "@/lib/types/client";
import { cn } from "@/lib/utils/cn";
import { User, Building2, Phone, Mail, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface KanbanColumn {
  id: ClientLeadStatus;
  titleKey: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "lead", titleKey: "newLead", color: "bg-slate-100 border-slate-200 text-slate-700" },
  { id: "contacted", titleKey: "contacted", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "consultation", titleKey: "consultation", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "retained", titleKey: "retained", color: "bg-green-50 border-green-200 text-green-700" },
];

interface ClientKanbanBoardProps {
  clients: Client[];
  isRTL: boolean;
}

export function ClientKanbanBoard({ clients, isRTL }: ClientKanbanBoardProps) {
  const { mutate: updateClient } = useUpdateClient();
  const { t } = useI18n();
  const [draggedClientId, setDraggedClientId] = useState<number | null>(null);
  const router = useRouter();

  // Group clients by status
  const clientsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = clients.filter(c => (c.leadStatus || "lead") === col.id);
    return acc;
  }, {} as Record<ClientLeadStatus, Client[]>);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedClientId(id);
    e.dataTransfer.effectAllowed = "move";
    // For visual drag image customization (optional)
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ClientLeadStatus) => {
    e.preventDefault();
    if (draggedClientId !== null) {
      const client = clients.find(c => c.id === draggedClientId);
      if (client && client.leadStatus !== targetStatus) {
        updateClient({ id: draggedClientId, input: { leadStatus: targetStatus } });
      }
    }
    setDraggedClientId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x min-h-[600px]">
      {COLUMNS.map(col => (
        <div 
          key={col.id} 
          className="flex-shrink-0 w-80 bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col snap-center"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          {/* Column Header */}
          <div className={cn("px-4 py-3 border-b flex items-center justify-between", col.color)}>
            <h3 className="font-bold text-sm">{t(`clients.kanban.${col.titleKey}`)}</h3>
            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-medium">
              {clientsByStatus[col.id].length}
            </span>
          </div>

          {/* Cards Container */}
          <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
            {clientsByStatus[col.id].map(client => (
              <div
                key={client.id}
                draggable
                onDragStart={(e) => handleDragStart(e, client.id)}
                onDragEnd={() => setDraggedClientId(null)}
                onClick={() => router.push(`/clients/${client.id}`)}
                className={cn(
                  "bg-white rounded-xl p-4 border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#D97706]/50 transition-all",
                  draggedClientId === client.id ? "opacity-50 scale-95" : "opacity-100"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase shadow-sm">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2942] line-clamp-1">{client.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        {client.type === 'company' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {t(`clients.types.${client.type}`)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-3">
                  {client.contactPhone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.contactPhone}</span>
                    </div>
                  )}
                  {client.contactEmail && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{client.contactEmail}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                  </div>
                  {client.tags && client.tags.length > 0 && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600">
                      {client.tags[0]} {client.tags.length > 1 && `+${client.tags.length - 1}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {clientsByStatus[col.id].length === 0 && (
              <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium content-center text-center">
                {t("clients.dropHere")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
