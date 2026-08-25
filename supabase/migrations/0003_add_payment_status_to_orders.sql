-- Add payment_status column to orders table
alter table public.orders
add column if not exists payment_status text not null default 'pending'
  check (payment_status in ('pending','paid','failed','cancelled'));

-- Add tracking_number column
alter table public.orders
add column if not exists tracking_number text;

-- Add estimated_delivery column
alter table public.orders
add column if not exists estimated_delivery timestamptz;

-- Add index for payment_status
create index if not exists idx_orders_payment_status on public.orders(payment_status);