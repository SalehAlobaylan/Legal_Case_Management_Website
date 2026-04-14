"use client";

import * as React from "react";
import { Send, MessageSquare, Mail, Smartphone, MessageCircle, Loader2, RotateCw, CheckCheck } from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import {
  useClientMessages,
  useSendMessageToClient,
  useMarkClientMessageRead,
  useRetryClientMessage,
} from "@/lib/hooks/use-clients";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useWebSocketStore } from "@/lib/store/websocket-store";
import type { ClientMessage } from "@/lib/types/client";

const templates = [
  {
    id: "hearing",
    type: "hearing_reminder" as const,
    en: "Reminder: your hearing is scheduled on {{date}}.",
    ar: "تذكير: جلستكم محددة بتاريخ {{date}}.",
  },
  {
    id: "doc_request",
    type: "document_request" as const,
    en: "Please share the requested documents at your earliest convenience.",
    ar: "يرجى مشاركة المستندات المطلوبة في أقرب وقت ممكن.",
  },
  {
    id: "invoice",
    type: "invoice_notice" as const,
    en: "A new invoice has been issued. Kindly review your portal billing section.",
    ar: "تم إصدار فاتورة جديدة. يرجى مراجعة قسم الفواتير في البوابة.",
  },
];

export function ClientMessagingCenter({ clientId }: { clientId: number }) {
  const { t, isRTL, locale } = useI18n();
  const { data: messages = [], isLoading } = useClientMessages(clientId);
  const sendMessage = useSendMessageToClient();
  const markRead = useMarkClientMessageRead(clientId);
  const retryMessage = useRetryClientMessage(clientId);
  const socket = useWebSocketStore((s) => s.socket);

  const [channel, setChannel] = React.useState<"in_app" | "email" | "sms" | "whatsapp">("in_app");
  const [type, setType] = React.useState<
    "case_update" | "hearing_reminder" | "document_request" | "invoice_notice" | "general"
  >("general");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [liveMessages, setLiveMessages] = React.useState<ClientMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    if (!socket) return;

    socket.emit("client-messages:join", { clientId });

    const onNewMessage = (payload: { clientId?: number; message?: ClientMessage }) => {
      if (payload?.clientId !== clientId || !payload?.message) return;
      setLiveMessages((prev) => {
        if (prev.some((m) => m.id === payload.message!.id)) return prev;
        return [payload.message!, ...prev];
      });
    };

    const onTyping = (payload: { clientId?: number; typing?: boolean }) => {
      if (payload?.clientId !== clientId) return;
      setIsTyping(Boolean(payload?.typing));
    };

    socket.on("client-messages:new", onNewMessage);
    socket.on("client-messages:typing", onTyping);

    return () => {
      socket.emit("client-messages:leave", { clientId });
      socket.off("client-messages:new", onNewMessage);
      socket.off("client-messages:typing", onTyping);
    };
  }, [socket, clientId]);

  const allMessages = React.useMemo(() => {
    const merged = [...liveMessages, ...messages];
    const seen = new Set<number>();
    return merged.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [liveMessages, messages]);

  const applyTemplate = (templateId: string) => {
    const tpl = templates.find((x) => x.id === templateId);
    if (!tpl) return;
    setType(tpl.type);
    setBody(locale === "ar" ? tpl.ar : tpl.en);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#0F2942]" />
          <h3 className="font-bold text-[#0F2942]">{t("clients.messagingCenter")}</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as any)}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="in_app">{t("clients.channelInApp")}</option>
            <option value="email">{t("clients.channelEmail")}</option>
            <option value="sms">{t("clients.channelSms")}</option>
            <option value="whatsapp">{t("clients.channelWhatsapp")}</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="general">{t("clients.messageTypeGeneral")}</option>
            <option value="case_update">{t("clients.messageTypeCaseUpdate")}</option>
            <option value="hearing_reminder">{t("clients.messageTypeHearingReminder")}</option>
            <option value="document_request">{t("clients.messageTypeDocumentRequest")}</option>
            <option value="invoice_notice">{t("clients.messageTypeInvoiceNotice")}</option>
          </select>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl.id)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-start text-xs text-slate-700 hover:bg-slate-100"
            >
              {locale === "ar" ? tpl.ar : tpl.en}
            </button>
          ))}
        </div>

        {(channel === "email" || channel === "in_app") && (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("clients.messageSubject")}
            className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          />
        )}

        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            socket?.emit("client-messages:typing", { clientId, typing: e.target.value.length > 0 });
          }}
          placeholder={t("clients.messagePlaceholder")}
          className="mt-3 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />

        {isTyping && (
          <p className="mt-2 text-xs text-slate-500">{t("clients.typingNow")}</p>
        )}

        <div className={cn("mt-4 flex", isRTL ? "justify-start" : "justify-end") }>
          <Button
            className="bg-[#D97706] hover:bg-[#B45309] text-white"
            disabled={sendMessage.isPending || !body.trim()}
            onClick={() => {
              sendMessage.mutate(
                {
                  id: clientId,
                  message: body,
                  type,
                  channel,
                  subject: subject || undefined,
                },
                  {
                    onSuccess: () => {
                      setBody("");
                      setSubject("");
                      socket?.emit("client-messages:typing", { clientId, typing: false });
                    },
                  }
                );
              }}
          >
            {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ms-2">{t("clients.sendMessage")}</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="mb-3 text-sm font-bold text-slate-700">{t("clients.messageHistory")}</h4>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
          </div>
        ) : allMessages.length === 0 ? (
          <p className="text-sm text-slate-500">{t("clients.noMessagesYet")}</p>
        ) : (
          <div className="space-y-2">
            {allMessages.map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{m.channel === "email" ? <Mail className="inline h-3.5 w-3.5" /> : m.channel === "sms" ? <Smartphone className="inline h-3.5 w-3.5" /> : m.channel === "whatsapp" ? <MessageCircle className="inline h-3.5 w-3.5" /> : <MessageSquare className="inline h-3.5 w-3.5" />} <span className="ms-1">{m.channel}</span></span>
                  <span>{new Date(m.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</span>
                </div>
                {m.subject && <p className="mt-1 text-sm font-semibold text-slate-800">{m.subject}</p>}
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{m.body}</p>
                <div className="mt-2 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", m.status === "sent" ? "bg-emerald-100 text-emerald-700" : m.status === "failed" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
                    {m.direction === "inbound" ? t("clients.inbound") : t("clients.outbound")} · {m.status}
                  </span>
                  {m.errorMessage && <span className="ms-2 text-rose-600">{m.errorMessage}</span>}
                  <span className="ms-2 inline-flex items-center gap-1">
                    {!m.isRead ? (
                      <button
                        type="button"
                        onClick={() => markRead.mutate(m.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-slate-600 hover:bg-slate-50"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> {t("clients.markRead")}
                      </button>
                    ) : (
                      <span className="text-emerald-700">{t("clients.read")}</span>
                    )}

                    {m.status === "failed" && m.direction === "outbound" && (
                      <button
                        type="button"
                        onClick={() => retryMessage.mutate(m.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-amber-200 px-2 py-0.5 text-amber-700 hover:bg-amber-50"
                      >
                        <RotateCw className="h-3.5 w-3.5" /> {t("clients.retry")}
                      </button>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
