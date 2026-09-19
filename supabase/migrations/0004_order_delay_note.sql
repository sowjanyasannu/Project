-- Lets admin staff attach a customer-visible note to a delayed order
-- (e.g. "Your order has been delayed and will be delivered within the next 24 hours").
-- Covered by the existing RLS policies on public.orders (no new policy needed —
-- it's just another column on a table customers can already select their own row from
-- and only admins can update).

alter table public.orders
  add column delay_note text,
  add column delay_note_updated_at timestamptz;
