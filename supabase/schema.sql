-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS Table
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  birth_date date,
  zodiac_sign text,
  life_path_number integer,
  current_credits integer default 5, -- Free startup credits
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Users
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- TRANSACTIONS Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  amount decimal(10,2) not null,
  currency text default 'usd',
  credits_purchased integer,
  stripe_payment_id text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);

-- CONSULTATIONS Table (The "Brain" History)
create table public.consultations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  question text not null,
  answer text,
  model_used text default 'llama-3-8b-8192',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Consultations
alter table public.consultations enable row level security;
create policy "Users can view own consultations" on public.consultations for select using (auth.uid() = user_id);

-- PAID CONTENT Table
create table public.paid_content (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  content text, -- Could be a URL or markdown
  price_credits integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Paid Content (Publicly viewable metadata, content restricted via API check ideally, but here allowing read)
alter table public.paid_content enable row level security;
create policy "Public view of paid content metadata" on public.paid_content for select using (true);
