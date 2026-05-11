import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const SMTP_FROM = Deno.env.get("SMTP_FROM") || SMTP_USER;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "renqinjiang@ylghwl.cn";

interface EmailPayload {
  type: "new_quote" | "quote_update" | "order_update";
  quote_no?: string;
  order_no?: string;
  contact_email: string;
  contact_name: string;
  origin?: string;
  destination?: string;
  container_type?: string;
  quantity?: number;
  lease_days?: number;
  status?: string;
  rent_usd?: number;
  [key: string]: unknown;
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch(`https://api.postmarkapp.com/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Account-Token": SMTP_PASS,
    },
    body: JSON.stringify({
      From: SMTP_FROM,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: "outbound",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Email send failed:", text);
  }

  return response.ok;
}

serve(async (req) => {
  try {
    const payload: EmailPayload = await req.json();
    const { type } = payload;

    let subject = "";
    let html = "";
    let adminSubject = "";
    let adminHtml = "";

    if (type === "new_quote") {
      subject = `【询价单已收到】${payload.quote_no}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A5F;">您好，${payload.contact_name}</h2>
          <p>我们已收到您的询价单，内容如下：</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>询价单号</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.quote_no}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>起运地</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.origin}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>目的港</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.destination}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>箱型</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.container_type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>箱量</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.quantity}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>租期</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.lease_days}天</td></tr>
          </table>
          <p>我们的团队将在 <strong>24小时</strong> 内处理您的询价并发送报价。</p>
          <p>感谢您的信任！</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #64748B; font-size: 12px;">毅联国际 Container Leasing</p>
        </div>
      `;

      adminSubject = `【新询价单】${payload.quote_no} - ${payload.origin} → ${payload.destination}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">有新询价单！</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px;"><strong>单号</strong></td><td style="padding: 8px;">${payload.quote_no}</td></tr>
            <tr><td style="padding: 8px;"><strong>路线</strong></td><td style="padding: 8px;">${payload.origin} → ${payload.destination}</td></tr>
            <tr><td style="padding: 8px;"><strong>箱型/箱量</strong></td><td style="padding: 8px;">${payload.container_type} × ${payload.quantity}</td></tr>
            <tr><td style="padding: 8px;"><strong>租期</strong></td><td style="padding: 8px;">${payload.lease_days}天</td></tr>
            <tr><td style="padding: 8px;"><strong>联系人</strong></td><td style="padding: 8px;">${payload.contact_name}</td></tr>
            <tr><td style="padding: 8px;"><strong>邮箱</strong></td><td style="padding: 8px;"><a href="mailto:${payload.contact_email}">${payload.contact_email}</a></td></tr>
          </table>
        </div>
      `;
    } else if (type === "quote_update") {
      subject = `【报价通知】您的询价单 ${payload.quote_no} 已报价`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A5F;">您好，${payload.contact_name}</h2>
          <p>您的询价单 <strong>${payload.quote_no}</strong> 已收到报价。</p>
          <p>请登录平台查看详情或联系我们的团队确认订单。</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #64748B; font-size: 12px;">毅联国际 Container Leasing</p>
        </div>
      `;
    } else if (type === "order_update") {
      subject = `【订单状态更新】${payload.order_no}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A5F;">您好，${payload.contact_name}</h2>
          <p>您的订单 <strong>${payload.order_no}</strong> 状态已更新为：<strong>${payload.status}</strong></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #64748B; font-size: 12px;">毅联国际 Container Leasing</p>
        </div>
      `;
    }

    // 发送确认邮件给客户
    if (html) {
      await sendEmail(payload.contact_email, subject, html);
    }

    // 发送通知邮件给管理员
    if (adminHtml) {
      await sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});