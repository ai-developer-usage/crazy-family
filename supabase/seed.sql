-- ===========================================================================
-- Optional: load the demo "Bloom" family into your Supabase database so you
-- have something to look at. Run AFTER schema.sql. Delete these rows anytime.
-- ===========================================================================
insert into public.people
  (id, first_name, last_name, gender, photo_url, birth_date, death_date, birth_place, bio, father_id, mother_id, spouse_ids)
values
  ('11111111-1111-1111-1111-111111111111','Reginald','Bloom','male',null,'1940-04-12','2018-11-03','Brighton, England','The legendary patriarch who grew prize-winning roses.',null,null,'{22222222-2222-2222-2222-222222222222}'),
  ('22222222-2222-2222-2222-222222222222','Beatrice','Bloom','female',null,'1943-09-21',null,'Cork, Ireland','Matriarch, master baker, undefeated Scrabble champion.',null,null,'{11111111-1111-1111-1111-111111111111}'),
  ('33333333-3333-3333-3333-333333333333','Marcus','Bloom','male',null,'1968-02-28',null,'Brighton, England','Eldest son. Jazz pianist and terrible-pun enthusiast.','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','{44444444-4444-4444-4444-444444444444}'),
  ('44444444-4444-4444-4444-444444444444','Priya','Bloom','female',null,'1971-07-15',null,'Mumbai, India','Architect of half the family treehouse blueprints.',null,null,'{33333333-3333-3333-3333-333333333333}'),
  ('55555555-5555-5555-5555-555555555555','Sophia','Bloom','female',null,'1972-12-05',null,'Brighton, England','The adventurous aunt — three of seven summits and counting.','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','{}'),
  ('66666666-6666-6666-6666-666666666666','Leo','Bloom','male',null,'1998-05-30',null,'London, England','Video game designer and family meme historian.','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','{}'),
  ('77777777-7777-7777-7777-777777777777','Maya','Bloom','female',null,'2001-10-17',null,'London, England','Marine biologist in training. Will name every shark.','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','{}')
on conflict (id) do nothing;
