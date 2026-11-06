-- Optional Supabase foundation. NOT connected to the local app.
-- Apply only to a dedicated development project; production needs the RLS gates in docs.
begin;
create table public.bible_books (
 code text primary key,
 name text not null,
 chapter_count smallint not null check(chapter_count between 1 and 150)
);
create table public.bible_chapters (
 book_code text references public.bible_books(code),
 chapter smallint not null check(chapter>0),
 primary key(book_code,chapter)
);
create table public.learning_path_steps (
 path_id text not null,
 step smallint not null check(step between 0 and 2),
 primary key(path_id,step)
);
create table public.profiles (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check(length(display_name)<=60),
 sync_consented_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.chapter_reads (
 owner_id uuid not null references auth.users(id) on delete cascade,
 book_code text not null,
 chapter smallint not null,
 read_at timestamptz not null default now(),
 primary key(owner_id,book_code,chapter),
 foreign key(book_code,chapter) references public.bible_chapters(book_code,chapter)
);
create table public.path_progress (
 owner_id uuid not null references auth.users(id) on delete cascade,
 path_id text not null,
 step smallint not null,
 read_at timestamptz not null,
 completed_at timestamptz,
 primary key(owner_id,path_id,step),
 foreign key(path_id,step) references public.learning_path_steps(path_id,step)
);
create table public.notes (
 id uuid primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(length(body) between 1 and 10000),
 kind text not null check(kind in ('note','reflection','action')),
 book_code text,
 chapter smallint,
 verse_from smallint check(verse_from>0),
 verse_to smallint check(verse_to>=verse_from),
 revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 check((book_code is null and chapter is null and verse_from is null and verse_to is null) or (book_code is not null and chapter is not null)),
 foreign key(book_code,chapter) references public.bible_chapters(book_code,chapter)
);
create index notes_owner_updated on public.notes(owner_id,updated_at,id);
create function public.note_revision_guard() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 if new.revision<>old.revision+1 then raise exception 'revision_conflict' using errcode='40001'; end if;
 new.updated_at=now();
 return new;
end;
$$;
create trigger notes_revision before update on public.notes for each row execute function public.note_revision_guard();

alter table public.bible_books enable row level security;
alter table public.bible_chapters enable row level security;
alter table public.learning_path_steps enable row level security;
alter table public.profiles enable row level security;
alter table public.chapter_reads enable row level security;
alter table public.path_progress enable row level security;
alter table public.notes enable row level security;

create policy books_read on public.bible_books for select to anon,authenticated using(true);
create policy chapters_read on public.bible_chapters for select to anon,authenticated using(true);
create policy steps_read on public.learning_path_steps for select to anon,authenticated using(true);
create policy profile_owner on public.profiles for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy chapter_owner on public.chapter_reads for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy path_owner on public.path_progress for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy note_owner on public.notes for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
commit;
