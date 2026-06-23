import { sendAdminNotification } from '@/lib/telegram';

export async function POST(req) {
  const data = await req.json();
  await sendAdminNotification({
    product: data.product,
    qty: data.qty,
    price: data.price,
    customer: data.customer,
    phone: data.phone,
    wilaya: data.wilaya,
    commune: data.commune,
    address: data.address || '',
    deliveryType: data.deliveryType || 'home',
    deliveryPrice: data.deliveryPrice || 0,
    total: data.total,
  });
  return Response.json({ ok: true });
}
