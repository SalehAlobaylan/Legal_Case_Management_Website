/*
 * Maps known English notification title/message patterns from the backend
 * into Arabic for the notifications UI (API stores English; product default is Arabic).
 * Wording follows formal MSA suited to legal practice (Saudi context).
 */

const EXACT_TITLE: Record<string, string> = {
  "Document uploaded": "إضافة مستند إلى الملف",
  "Document deleted": "حذف مستند من الملف",
  "New Regulation Match Found": "تطابق تشريعي جديد",
  "AI found additional match": "تطابق تشريعي إضافي",
  "Sample AI suggestion": "تنبيه تجريبي — مطابقة مقترحة",
  "New Amendment to Labor Law": "تعديل على نظام العمل",
  "Commercial regulation updated": "تحديث على نظام تجاري",
  "Case status changed": "تغيُّر حالة القضية",
  "Hearing Scheduled": "جدولة جلسة",
  "New Document Added": "مستند جديد في الملف",
  "Document extraction ready": "اكتمال استخراج بيانات المستند",
  "MoJ System Maintenance": "صيانة منظومة وزارة العدل",
  "Daily filing reminder": "تذكير يومي بالمرفوعات",
  "Welcome to notification center": "مرحباً بكم في مركز التنبيهات",
  "Sample case update": "تنبيه تجريبي — تحديث قضية",
};

const EXACT_MESSAGE: Record<string, string> = {
  "Article 77 has been revised regarding compensation calculation.":
    "عُدِّلت المادة 77 من النظام في جزء احتساب التعويض.",
  "A subscribed regulation for procurement contracts has a new version.":
    "صدر إصدار جديد للنظام الذي تتابعونه والمتعلق بعقود المشتريات.",
  "A new high-confidence regulation match was found for your case.":
    "توفّرت مطابقة تشريعية عالية الثقة مع قضيتكم.",
  "Insights are now available for the latest uploaded document.":
    "باتت نتائج التحليل جاهزة لآخر المستندات المضافة إلى الملف.",
  "Scheduled for Friday 2:00 AM. Some services may be unavailable.":
    "تُنفَّذ الصيانة صباح يوم الجمعة (الساعة 2:00 فجراً). قد تنقطع بعض الخدمات مؤقتاً.",
  "Please verify all pending filings before end of day.":
    "يُنصح بمراجعة المرفوعات المعلّقة قبل انتهاء يوم العمل.",
  "This sample alert helps you verify unread badges immediately.":
    "هذا تنبيه تجريبي للتأكد من ظهور مؤشر الإشعارات غير المقروءة.",
  "Test notification for lawyer@test.com": "تنبيه تجريبي.",
  "Test notification for sara@test.com": "تنبيه تجريبي.",
};

function localizeRegulationMatchMessage(msg: string): string | null {
  const plural = msg.match(/^(\d+) new regulation matches found\.\s*$/i);
  if (plural) {
    const n = parseInt(plural[1], 10);
    if (n === 1) {
      return "مطابقة تشريعية جديدة واحدة بانتظار المراجعة.";
    }
    return `${n} مطابقات تشريعية جديدة بانتظار المراجعة.`;
  }
  const single = msg.match(/^(\d+) new regulation match found\.\s*$/i);
  if (single) {
    return "مطابقة تشريعية جديدة واحدة بانتظار المراجعة.";
  }
  return null;
}

function localizeDocumentMessage(msg: string): string | null {
  const up = msg.match(/^"(.+)" was uploaded to case #(\d+)\.\s*$/);
  if (up) {
    return `أُضيف المستند «${up[1]}» إلى ملف القضية رقم ${up[2]}.`;
  }
  const del = msg.match(/^"(.+)" was deleted from case #(\d+)\.\s*$/);
  if (del) {
    return `أُزيل المستند «${del[1]}» من ملف القضية رقم ${del[2]}.`;
  }
  const genericUp = msg.match(/^(.+?) uploaded to case (.+)\.\s*$/);
  if (genericUp) {
    return `أُضيف ${genericUp[1].trim()} إلى ملف القضية ${genericUp[2].trim()}.`;
  }
  return null;
}

/**
 * Returns Arabic title and message when the payload matches known backend strings;
 * otherwise returns the originals (e.g. user-authored case titles stay as-is).
 */
export function toArabicNotificationContent(
  title: string,
  message: string
): { title: string; message: string } {
  const t = title.trim();
  const m = (message || "").trim();

  let titleAr = t;
  let messageAr = m;

  const aiTitle = t.match(/^AI suggestions generated for Case\s+(.+)$/i);
  if (aiTitle) {
    const ref = aiTitle[1].trim();
    titleAr = `مطابقات جديدة للقضية ${ref}`;
  } else if (/^Case created:\s*/i.test(t)) {
    const rest = t.replace(/^Case created:\s*/i, "").trim();
    titleAr = `تسجيل قضية جديدة — ${rest}`;
  } else if (/^Case updated:\s*/i.test(t)) {
    const rest = t.replace(/^Case updated:\s*/i, "").trim();
    titleAr = `تحديث بيانات القضية — ${rest}`;
  } else if (EXACT_TITLE[t]) {
    titleAr = EXACT_TITLE[t];
  }

  const matchMsg = localizeRegulationMatchMessage(m);
  if (matchMsg) {
    messageAr = matchMsg;
  } else {
    const docMsg = localizeDocumentMessage(m);
    if (docMsg) {
      messageAr = docMsg;
    } else {
      const aiDisc = m.match(/^AI discovered a relevant regulation for case (.+)\.\s*$/i);
      if (aiDisc) {
        const ref = aiDisc[1].trim();
        messageAr = `يُستحسن مراجعة نص تشريعي مرتبط بالقضية ${ref}.`;
      } else {
        const status = m.match(/^Case (.+?) moved to pending hearing\.\s*$/i);
        if (status) {
          messageAr = `انتقلت القضية ${status[1].trim()} إلى مرحلة انتظار الجلسة.`;
        } else if (EXACT_MESSAGE[m]) {
          messageAr = EXACT_MESSAGE[m];
        } else if (
          /^Next hearing for .+ scheduled for next week\.\s*$/i.test(m)
        ) {
          messageAr = "الجلسة التالية مجدولة خلال الأسبوع القادم.";
        }
      }
    }
  }

  return { title: titleAr, message: messageAr };
}
