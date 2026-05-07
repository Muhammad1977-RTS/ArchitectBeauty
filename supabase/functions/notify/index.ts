// @ts-nocheck — Deno runtime, URL-импорты не поддерживаются Node.js TypeScript-компилятором
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY       = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL          = Deno.env.get('APP_URL') ?? 'https://architectbeauty.ru'
const FROM_EMAIL = 'ArchitectBeauty <onboarding@resend.dev>'
//const FROM_EMAIL       = 'ArchitectBeauty <noreply@architectbeauty.ru>'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, unknown>
  old_record?: Record<string, unknown>
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  })
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text())
  }
}

function emailLayout(body: string) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111111">
      <div style="margin-bottom:24px">
        <span style="font-size:24px">🏗️</span>
        <span style="font-size:18px;font-weight:700;color:#FF5A5F;margin-left:8px">ArchitectBeauty</span>
      </div>
      ${body}
      <hr style="border:none;border-top:1px solid #DDDDDD;margin:32px 0">
      <p style="font-size:12px;color:#555555">Вы получили это письмо потому, что зарегистрированы на ArchitectBeauty.</p>
    </div>
  `
}

serve(async (req: Request) => {
  const payload: WebhookPayload = await req.json()
  const { type, table, record, old_record } = payload

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  // ── 1. Новая заявка → уведомить мастеров с подходящей специализацией ──
  if (table === 'orders' && type === 'INSERT') {
    const workTypeId = record['work_type_id'] as string

    const [{ data: workType }, { data: masters }] = await Promise.all([
      db.from('work_types').select('name').eq('id', workTypeId).single(),
      db.from('master_rates').select('master_id').eq('work_type_id', workTypeId),
    ])

    const typeName = workType?.name ?? 'Ремонт'

    for (const m of masters ?? []) {
      const { data: auth } = await db.auth.admin.getUserById(m.master_id as string)
      if (!auth?.user?.email) continue

      await sendEmail(
        auth.user.email,
        `Новая заявка: ${typeName}`,
        emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px">По вашей специализации — новая заявка</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#555555;width:120px">Вид работы</td><td style="font-weight:600">${typeName}</td></tr>
            <tr><td style="padding:8px 0;color:#555555">Площадь</td><td style="font-weight:600">${record['area_sqm']} м²</td></tr>
            <tr><td style="padding:8px 0;color:#555555">Адрес</td><td>${record['address']}</td></tr>
          </table>
          <a href="${APP_URL}/master/orders/${record['id']}"
             style="display:inline-block;padding:12px 24px;background:#FF5A5F;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">
            Посмотреть заявку
          </a>
        `)
      )
    }
  }

  // ── 2. Новый отклик → уведомить клиента ──
  if (table === 'responses' && type === 'INSERT') {
    const { data: order } = await db
      .from('orders')
      .select('client_id, address, work_types(name)')
      .eq('id', record['order_id'] as string)
      .single()

    if (order) {
      const { data: auth } = await db.auth.admin.getUserById(order.client_id as string)
      if (auth?.user?.email) {
        const typeName = (order.work_types as { name: string } | null)?.name ?? 'Ремонт'
        const price = (record['proposed_price'] as number)
          .toLocaleString('ru-RU') + ' ₽'

        await sendEmail(
          auth.user.email,
          `На вашу заявку откликнулся мастер`,
          emailLayout(`
            <h2 style="margin:0 0 16px;font-size:20px">Новый отклик на вашу заявку</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:8px 0;color:#555555;width:120px">Заявка</td><td style="font-weight:600">${typeName} — ${order.address}</td></tr>
              <tr><td style="padding:8px 0;color:#555555">Цена</td><td style="font-weight:600;color:#FF5A5F">${price}</td></tr>
              ${record['estimated_days'] ? `<tr><td style="padding:8px 0;color:#555555">Срок</td><td>${record['estimated_days']} дн.</td></tr>` : ''}
              ${record['comment'] ? `<tr><td style="padding:8px 0;color:#555555">Комментарий</td><td>${record['comment']}</td></tr>` : ''}
            </table>
            <a href="${APP_URL}/client/orders/${record['order_id']}"
               style="display:inline-block;padding:12px 24px;background:#FF5A5F;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">
              Смотреть отклики
            </a>
          `)
        )
      }
    }
  }

  // ── 3. Клиент выбрал мастера → уведомить мастера ──
  if (
    table === 'orders' &&
    type === 'UPDATE' &&
    record['status'] === 'master_selected' &&
    old_record?.['status'] !== 'master_selected'
  ) {
    const masterId = record['selected_master_id'] as string
    if (!masterId) return new Response('ok', { status: 200 })

    const [{ data: auth }, { data: workType }] = await Promise.all([
      db.auth.admin.getUserById(masterId),
      db.from('work_types').select('name').eq('id', record['work_type_id'] as string).single(),
    ])

    if (auth?.user?.email) {
      const typeName = workType?.name ?? 'Ремонт'
      const orderId  = record['id'] as string

      await sendEmail(
        auth.user.email,
        `Вас выбрали по заявке #${orderId.slice(0, 8)}`,
        emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px">🎉 Клиент выбрал вас!</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#555555;width:120px">Вид работы</td><td style="font-weight:600">${typeName}</td></tr>
            <tr><td style="padding:8px 0;color:#555555">Площадь</td><td style="font-weight:600">${record['area_sqm']} м²</td></tr>
            <tr><td style="padding:8px 0;color:#555555">Адрес</td><td>${record['address']}</td></tr>
          </table>
          <p style="color:#555555">Свяжитесь с клиентом для уточнения деталей и начала работ.</p>
          <a href="${APP_URL}/master/orders/${orderId}"
             style="display:inline-block;padding:12px 24px;background:#FF5A5F;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">
            Открыть заявку
          </a>
        `)
      )
    }
  }

  return new Response('ok', { status: 200 })
})
