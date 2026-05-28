-- ============================================================================
-- Quickfund — Seed data
-- 1) Product catalogue (real Quickfund pricing, see docs/business/products/PRICING.md)
-- 2) Procedural demo dataset: clients, loans, amortization schedules, payments,
--    with 14 months of history, overdue installments and a few defaults so the
--    dashboard P&L / overdue views are populated immediately.
-- Safe to re-run: products upsert by slug; demo block is skipped if clients exist.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Products
-- ----------------------------------------------------------------------------
insert into public.products
  (slug, name, category, description, min_amount, max_amount,
   min_duration_months, max_duration_months, min_rate, max_rate, default_rate,
   application_fee_percent, sort_order)
values
  ('micro-credit','Micro-crédit','credit','Petits montants dès 20€, profils atypiques acceptés.',
     20,500,1,3,12,25,18,1,1),
  ('consumer','Crédit conso','credit','Crédit à la consommation 100% transparent.',
     500,5000,3,36,6,22,12,1,2),
  ('professional','Crédit pro','credit','Financement TPE/PME, revenus variables acceptés.',
     1000,10000,3,24,6,20,11,1,3),
  ('student','Prêt étudiant','credit','Sans garant, différé possible.',
     500,5000,6,36,6,15,9,0,4),
  ('salary-advance','Avance sur salaire','credit','Évitez le découvert, remboursement court.',
     50,1500,1,2,8,20,14,0,5),
  ('leasing','Leasing','credit','Le bien sert de garantie, taux avantageux.',
     1000,20000,12,60,5,14,9,1.5,6),
  ('loan-consolidation','Regroupement de crédits','credit','Une seule mensualité, plus de visibilité.',
     1000,50000,12,84,6,16,11,1,7),
  ('financial-coaching','Coaching financier','service','Accompagnement budgétaire (basic inclus, premium ~25€/mois).',
     0,0,1,12,0,0,0,0,8)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  min_duration_months = excluded.min_duration_months,
  max_duration_months = excluded.max_duration_months,
  min_rate = excluded.min_rate,
  max_rate = excluded.max_rate,
  default_rate = excluded.default_rate,
  application_fee_percent = excluded.application_fee_percent,
  sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- 2) Procedural demo dataset
-- ----------------------------------------------------------------------------
do $$
declare
  v_first   text[] := array['Marie','Thomas','Alex','Lucas','Emma','Lea','Hugo','Chloe','Nathan','Sarah','Julien','Camille','Maxime','Manon','Antoine','Laura','Romain','Pauline','Kevin','Sophie','Mehdi','Ines','Yann','Clara','Dimitri','Anna','Marko','Liis','Kristjan','Mart','Kadri','Jaan'];
  v_last    text[] := array['Martin','Bernard','Dubois','Petit','Robert','Tamm','Saar','Magi','Kask','Kukk','Rebane','Ivanov','Smirnov','Laine','Nguyen','Garcia','Muller','Lemoine','Faure','Roussel','Vidal','Carre','Lopez','Sokk','Parn','Vaher','Raud','Lille','Kallas','Oja','Lepik','Sepp'];
  v_city    text[] := array['Tallinn','Tartu','Narva','Parnu','Paris','Lyon','Bruxelles','Madrid','Geneve','Helsinki'];
  v_emp     text[] := array['cdi','cdi','cdi','cdd','freelance','student','retired','unemployed'];
  v_house   text[] := array['owner','tenant','tenant','hosted'];
  v_hist    text[] := array['excellent','good','good','mixed','incidents'];
  v_cat     text[] := array['A','A','A','B','B','C','D'];
  v_purpose text[] := array['auto','homeImprovement','equipment','emergency','medical','travel','consolidation','event'];
  v_method  text[] := array['sepa','sepa','sepa','transfer','card'];

  i int; j int; k int; nloans int; months_ago int;
  cli_id uuid; cli_cat text; cli_income numeric; cli_f text; cli_l text;
  v_loan_id uuid; p record; inst record;
  v_amount numeric; v_dur int; v_rate numeric; v_start date; v_due date;
  v_mr numeric; v_pay numeric; v_bal numeric; v_int numeric; v_prin numeric;
  v_total_int numeric; v_total_rep numeric; v_loan_status text;
  delinquent boolean; defaulted boolean; pay_date date;
begin
  if (select count(*) from public.clients) > 0 then
    raise notice 'Demo data already present — skipping demo seed.';
    return;
  end if;

  for i in 1..32 loop
    cli_f := v_first[1 + (i % array_length(v_first,1))];
    cli_l := v_last[1 + ((i*3) % array_length(v_last,1))];
    cli_cat := v_cat[1 + (i % array_length(v_cat,1))];
    cli_income := 1200 + (i % 9) * 450;

    insert into public.clients
      (first_name,last_name,email,phone,birth_date,city,country,marital_status,dependents,
       employment_status,employer_name,monthly_net_income,monthly_expenses,housing_status,
       credit_history,risk_category,status)
    values
      (cli_f, cli_l,
       lower(cli_f)||'.'||lower(cli_l)||i||'@example.com',
       '+372 5'||lpad((1000000 + i*37)::text,7,'0'),
       (date '1990-01-01' - (i*97))::date,
       v_city[1 + (i % array_length(v_city,1))],
       case when i % 3 = 0 then 'FR' else 'EE' end,
       case when i % 2 = 0 then 'married' else 'single' end,
       i % 3,
       v_emp[1 + (i % array_length(v_emp,1))],
       'Employer '||(i % 12),
       cli_income,
       round((cli_income*0.45)::numeric,2),
       v_house[1 + (i % array_length(v_house,1))],
       v_hist[1 + (i % array_length(v_hist,1))],
       cli_cat,
       case when i % 13 = 0 then 'inactive' else 'active' end)
    returning id into cli_id;

    defaulted := (i % 11 = 0);
    nloans := 1 + (i % 2);

    for j in 1..nloans loop
      select * into p from public.products
        where category = 'credit'
        order by sort_order
        offset ((i + j) % 7) limit 1;

      v_amount := round((p.min_amount + (p.max_amount - p.min_amount) * (((i*7 + j*13) % 100) / 100.0))::numeric, 0);
      if v_amount < p.min_amount then v_amount := p.min_amount; end if;

      v_dur := p.min_duration_months + ((i + j) % greatest(p.max_duration_months - p.min_duration_months, 1));
      if v_dur < 1 then v_dur := 1; end if;

      v_rate := case cli_cat
                  when 'A' then p.min_rate
                  when 'B' then round(((p.min_rate + p.max_rate)/2 - 1)::numeric, 2)
                  when 'C' then round(((p.min_rate + p.max_rate)/2 + 1)::numeric, 2)
                  else p.max_rate end;

      months_ago := (i + j*3) % 14;
      v_start := (date_trunc('month', current_date) - (months_ago || ' months')::interval)::date + (i % 25);

      v_mr := v_rate / 100.0 / 12.0;
      if v_mr = 0 then
        v_pay := round((v_amount / v_dur)::numeric, 2);
      else
        v_pay := round((v_amount * v_mr / (1 - power(1 + v_mr, -v_dur)))::numeric, 2);
      end if;

      delinquent := (i % 5 = 0) or (defaulted and j = 1);

      insert into public.loans
        (client_id, product_id, principal_amount, annual_rate, duration_months, monthly_payment,
         total_interest, total_repayable, application_fee, purpose, risk_category, status,
         start_date, end_date, disbursed_at)
      values
        (cli_id, p.id, v_amount, v_rate, v_dur, v_pay, 0, 0,
         round((v_amount * p.application_fee_percent / 100)::numeric, 2),
         v_purpose[1 + ((i + j) % array_length(v_purpose,1))], cli_cat, 'active',
         v_start, (v_start + (v_dur || ' months')::interval)::date, v_start)
      returning id into v_loan_id;

      v_bal := v_amount;
      v_total_int := 0;
      for k in 1..v_dur loop
        v_int := round((v_bal * v_mr)::numeric, 2);
        v_prin := round((v_pay - v_int)::numeric, 2);
        if k = v_dur then
          v_prin := v_bal;
        end if;
        v_bal := round((v_bal - v_prin)::numeric, 2);
        v_total_int := v_total_int + v_int;
        v_due := (v_start + (k || ' months')::interval)::date;

        insert into public.installments
          (loan_id, sequence, due_date, amount_due, principal_component, interest_component,
           amount_paid, status)
        values
          (v_loan_id, k, v_due, round((v_prin + v_int)::numeric, 2), v_prin, v_int, 0, 'pending')
        returning * into inst;

        if v_due < current_date then
          if delinquent and v_due >= (current_date - interval '75 days') then
            null;  -- leave recent installments overdue
          else
            pay_date := v_due + (i % 4);
            update public.installments
              set status = 'paid', amount_paid = inst.amount_due, paid_at = pay_date
              where id = inst.id;
            insert into public.payments
              (loan_id, client_id, installment_id, amount, payment_date, method, status)
            values
              (v_loan_id, cli_id, inst.id, inst.amount_due, pay_date,
               v_method[1 + ((i + k) % array_length(v_method,1))], 'completed');
          end if;
        end if;
      end loop;

      v_total_rep := round((v_amount + v_total_int)::numeric, 2);

      if (select count(*) from public.installments where loan_id = v_loan_id and status <> 'paid') = 0 then
        v_loan_status := 'paid_off';
      elsif defaulted and j = 1 then
        v_loan_status := 'defaulted';
      else
        v_loan_status := 'active';
      end if;

      update public.loans
        set total_interest = round(v_total_int::numeric, 2),
            total_repayable = v_total_rep,
            status = v_loan_status
        where id = v_loan_id;
    end loop;
  end loop;

  -- A few inbound leads for the applications page (full funnel dossiers)
  insert into public.loan_applications
    (status, credit_type, amount, duration, monthly_payment, effective_rate, country,
     first_name, last_name, email, phone, city, birth_date, birth_place, nationality,
     marital_status, id_type, id_number, address, postal_code, address_country,
     employer_name, employer_address, job_title, contract_type, start_date,
     monthly_net_income, document_id_url, document_income_url, document_address_url, document_bank_url)
  values
    ('submitted','consumer',3000,24,145.50,12.5,'EE','Liis','Tamm','liis.tamm@example.com','+372 5550101','Tallinn',
     '1990-03-14','Tallinn','EE','married','national_id','EE39003140123','Narva mnt 7','10117','EE',
     'Swedbank','Liivalaia 8, Tallinn','Analyste','cdi','2019-06-01',2600,
     'https://docs.example.com/liis/id.pdf','https://docs.example.com/liis/income.pdf',null,null),
    ('under_review','micro-credit',400,3,140.00,18.0,'EE','Karl','Saar','karl.saar@example.com','+372 5550102','Tartu',
     '2000-11-02','Tartu','EE','single','national_id','EE50011020456','Riia 15','51010','EE',
     'Bolt','Vana-Lõuna 15, Tallinn','Chauffeur','cdd','2023-02-01',1450,
     'https://docs.example.com/karl/id.pdf',null,null,null),
    ('approved','professional',8000,18,490.00,11.0,'FR','Romain','Faure','romain.faure@example.com','+33 612345678','Lyon',
     '1984-05-21','Lyon','FR','married','passport','FR18X45221','Rue de la Republique 22','69002','FR',
     'Faure Consulting','Rue Garibaldi 40, Lyon','Gerant','freelance','2016-09-01',4200,
     'https://docs.example.com/romain/id.pdf','https://docs.example.com/romain/income.pdf',null,'https://docs.example.com/romain/bank.pdf'),
    ('submitted','student',2500,30,90.00,8.0,'EE','Anna','Kask','anna.kask@example.com','+372 5550104','Parnu',
     '2003-08-09','Parnu','EE','single','national_id','EE60308090789','Pikk 3','80010','EE',
     'TalTech','Ehitajate tee 5, Tallinn','Etudiante','student','2022-09-01',650,
     'https://docs.example.com/anna/id.pdf',null,'https://docs.example.com/anna/address.pdf',null),
    ('rejected','consumer',6000,36,200.00,15.0,'ES','Sofia','Lopez','sofia.lopez@example.com','+34 600112233','Madrid',
     '1979-12-01','Madrid','ES','divorced','national_id','ES12791201XYZ','Calle Alcala 100','28009','ES',
     'El Corte Ingles','Calle Hermosilla 112, Madrid','Vendeuse','cdi','2011-03-01',1900,
     'https://docs.example.com/sofia/id.pdf','https://docs.example.com/sofia/income.pdf','https://docs.example.com/sofia/address.pdf','https://docs.example.com/sofia/bank.pdf'),
    ('submitted','salary-advance',800,2,415.00,14.0,'EE','Mart','Oja','mart.oja@example.com','+372 5550106','Narva',
     '1995-04-18','Narva','EE','single','national_id','EE49504180321','Kreenholmi 5','20308','EE',
     'Eesti Energia','Lelle 22, Tallinn','Technicien','cdi','2020-01-15',2300,
     'https://docs.example.com/mart/id.pdf','https://docs.example.com/mart/income.pdf',null,null);

  raise notice 'Seed complete: % clients, % loans, % installments, % payments',
    (select count(*) from public.clients),
    (select count(*) from public.loans),
    (select count(*) from public.installments),
    (select count(*) from public.payments);
end;
$$;

-- ----------------------------------------------------------------------------
-- 3) CRM smoke data — scores (+ history), KYC documents, interactions, tasks,
--    contracts and richer applications. Mirrors app/_lib/admin/scoring.ts so the
--    seeded scores match the live engine. Skipped once client_scores is populated.
-- ----------------------------------------------------------------------------
do $$
declare
  c record; v_loan record;
  i int := 0;
  v_debt numeric; v_income numeric; v_exp numeric; v_dep int;
  v_emp text; v_house text; v_hist text; v_birth date; v_since date;
  s_ch int; s_emp int; s_house int; s_dti int; s_disp int; s_sen int; s_age int;
  v_ratio numeric; v_perhead numeric; v_months int; v_age int;
  v_score int; v_cat text; v_factors jsonb; v_reasons jsonb;
  v_doc_status text; v_contract_status text; v_signed timestamptz;
  v_app_count int;
begin
  if (select count(*) from public.client_scores) > 0 then
    raise notice 'CRM data already present — skipping CRM seed.';
    return;
  end if;

  for c in select * from public.clients order by created_at loop
    i := i + 1;
    v_income := coalesce(c.monthly_net_income, 0);
    v_exp    := coalesce(c.monthly_expenses, 0);
    v_dep    := coalesce(c.dependents, 0);
    v_emp    := lower(coalesce(c.employment_status, ''));
    v_house  := lower(coalesce(c.housing_status, ''));
    v_hist   := lower(coalesce(c.credit_history, ''));
    v_birth  := c.birth_date;
    v_since  := (current_date - ((6 + (i * 7) % 90) || ' months')::interval)::date;

    update public.clients
      set employment_since = coalesce(employment_since, v_since),
          consent_given_at = coalesce(consent_given_at, c.created_at),
          marketing_opt_in = (i % 3 = 0)
      where id = c.id;

    select coalesce(sum(monthly_payment), 0) into v_debt
      from public.loans where client_id = c.id and status = 'active';

    s_ch := case v_hist when 'excellent' then 100 when 'good' then 75 when 'mixed' then 45 when 'incidents' then 20 else 45 end;
    s_emp := case v_emp when 'cdi' then 100 when 'retired' then 90 when 'freelance' then 65 when 'cdd' then 60 when 'student' then 40 when 'unemployed' then 20 else 50 end;
    s_house := case v_house when 'owner' then 100 when 'tenant' then 70 when 'hosted' then 40 else 60 end;

    v_ratio := case when v_income > 0 then v_debt / v_income else 1 end;
    s_dti := case when v_ratio <= 0.25 then 100 when v_ratio <= 0.33 then 85 when v_ratio <= 0.40 then 60 when v_ratio <= 0.50 then 35 else 15 end;

    v_perhead := (v_income - v_exp - v_debt) / (1 + v_dep);
    s_disp := case when v_perhead >= 1200 then 100 when v_perhead >= 800 then 85 when v_perhead >= 500 then 65 when v_perhead >= 250 then 40 when v_perhead >= 0 then 20 else 0 end;

    v_months := (extract(year from age(current_date, v_since)) * 12 + extract(month from age(current_date, v_since)))::int;
    s_sen := case when v_months >= 24 then 100 when v_months >= 12 then 80 when v_months >= 6 then 50 else 30 end;

    v_age := case when v_birth is not null then extract(year from age(current_date, v_birth))::int else 40 end;
    s_age := case when v_age between 26 and 45 then 100 when v_age between 46 and 55 then 90 when v_age between 56 and 65 then 80 when v_age between 18 and 25 then 70 when v_age between 66 and 75 then 70 else 40 end;

    v_score := greatest(0, least(100, round((s_ch * 25 + s_dti * 22 + s_emp * 18 + s_disp * 12 + s_sen * 8 + s_house * 8 + s_age * 7) / 100.0)));
    v_cat := case when v_score >= 80 then 'A' when v_score >= 65 then 'B' when v_score >= 50 then 'C' else 'D' end;

    v_factors := jsonb_build_array(
      jsonb_build_object('code','credit_history','label','Historique de crédit','weight',25,'raw',v_hist,'score',s_ch,'contribution',round(s_ch * 25 / 100.0, 1),'status','ok'),
      jsonb_build_object('code','dti','label','Taux d''endettement','weight',22,'raw',(round(v_ratio * 100) || ' %'),'score',s_dti,'contribution',round(s_dti * 22 / 100.0, 1),'status','ok'),
      jsonb_build_object('code','income_stability','label','Stabilité des revenus','weight',18,'raw',upper(v_emp),'score',s_emp,'contribution',round(s_emp * 18 / 100.0, 1),'status','ok'),
      jsonb_build_object('code','disposable_income','label','Reste à vivre','weight',12,'raw',(round(v_perhead) || ' €'),'score',s_disp,'contribution',round(s_disp * 12 / 100.0, 1),'status','ok'),
      jsonb_build_object('code','seniority','label','Ancienneté emploi','weight',8,'raw',(v_months || ' mois'),'score',s_sen,'contribution',round(s_sen * 8 / 100.0, 1),'status','ok'),
      jsonb_build_object('code','housing','label','Logement','weight',8,'raw',v_house,'score',s_house,'contribution',round(s_house * 8 / 100.0, 1),'status','ok'),
      jsonb_build_object('code','age','label','Âge','weight',7,'raw',(v_age || ' ans'),'score',s_age,'contribution',round(s_age * 7 / 100.0, 1),'status','ok')
    );

    v_reasons := (
      select coalesce(jsonb_agg(jsonb_build_object('code', code, 'label', label, 'score', sc)), '[]'::jsonb)
      from (
        select code, label, sc from (values
          ('credit_history','Historique de crédit',s_ch),
          ('dti','Taux d''endettement',s_dti),
          ('income_stability','Stabilité des revenus',s_emp),
          ('disposable_income','Reste à vivre',s_disp),
          ('seniority','Ancienneté emploi',s_sen),
          ('housing','Logement',s_house),
          ('age','Âge',s_age)
        ) as t(code, label, sc)
        where sc < 100
        order by sc asc
        limit 3
      ) q
    );

    insert into public.client_scores (client_id, score, category, factors, reason_codes, dti, is_complete, model_version, source, computed_at)
      values (c.id, v_score, v_cat, v_factors, v_reasons, round(v_ratio, 3), true, 'v1', 'seed', c.created_at + interval '1 hour');
    insert into public.client_scores (client_id, score, category, factors, reason_codes, dti, is_complete, model_version, source, computed_at)
      values (c.id, greatest(0, least(100, v_score - 3 + (i % 6))), v_cat, '[]'::jsonb, '[]'::jsonb, round(v_ratio, 3), true, 'v1', 'seed', c.created_at - interval '60 days');

    update public.clients
      set credit_score = v_score, risk_category = v_cat,
          score_updated_at = c.created_at + interval '1 hour',
          score_is_stale = (c.created_at < current_date - interval '120 days')
      where id = c.id;

    -- KYC documents (mix of verified / received / missing / expiring)
    v_doc_status := case c.status when 'prospect' then 'received' else 'verified' end;
    insert into public.client_documents (client_id, type, label, url, status, issued_on, expires_on, uploaded_at, verified_at)
    values
      (c.id, 'id', 'Carte d''identité', 'https://docs.example.com/' || c.id || '/id.pdf', v_doc_status,
        (current_date - interval '2 years')::date, (current_date + (case when i % 7 = 0 then -20 else 800 end || ' days')::interval)::date,
        c.created_at, case when v_doc_status = 'verified' then c.created_at else null end),
      (c.id, 'income', 'Bulletins de salaire', 'https://docs.example.com/' || c.id || '/income.pdf',
        case when c.status = 'prospect' and i % 2 = 0 then 'received' else v_doc_status end,
        (current_date - interval '2 months')::date, null, c.created_at, case when v_doc_status = 'verified' then c.created_at else null end),
      (c.id, 'address', 'Justificatif de domicile',
        case when c.status = 'prospect' and i % 3 = 0 then null else 'https://docs.example.com/' || c.id || '/address.pdf' end,
        case when c.status = 'prospect' and i % 3 = 0 then 'missing' else v_doc_status end,
        (current_date - interval '1 month')::date, null,
        case when c.status = 'prospect' and i % 3 = 0 then null else c.created_at end, null),
      (c.id, 'bank', 'RIB', 'https://docs.example.com/' || c.id || '/bank.pdf', v_doc_status,
        null, null, c.created_at, case when v_doc_status = 'verified' then c.created_at else null end);

    -- interactions (relationship timeline)
    insert into public.interactions (client_id, type, subject, body, occurred_at)
      values (c.id, 'system', 'Dossier créé', 'Client enregistré dans le CRM.', c.created_at);
    insert into public.interactions (client_id, type, direction, subject, body, occurred_at)
      values (c.id, case when i % 2 = 0 then 'call' else 'email' end, 'out',
        case when i % 2 = 0 then 'Appel de bienvenue' else 'Email de suivi' end,
        'Prise de contact et vérification des informations.', c.created_at + interval '2 days');

    -- tasks
    if c.status = 'prospect' then
      insert into public.tasks (client_id, title, category, priority, status, due_date)
        values (c.id, 'Vérifier les pièces KYC', 'kyc', 'high', 'open', current_date + (case when i % 2 = 0 then -2 else 4 end));
      insert into public.tasks (client_id, title, category, priority, status, due_date)
        values (c.id, 'Envoyer l''offre de contrat', 'signature', 'normal', 'open', (current_date + 6));
    else
      insert into public.tasks (client_id, title, category, priority, status, due_date, completed_at)
        values (c.id, 'Revue annuelle du dossier', 'review', 'low', 'done', (current_date - 20), now() - interval '18 days');
    end if;
  end loop;

  -- collection tasks for clients with overdue installments
  insert into public.tasks (client_id, loan_id, title, category, priority, status, due_date)
  select distinct l.client_id, l.id, 'Relancer impayé', 'collection', 'urgent', 'open', (current_date - 1)
  from public.loans l
  join public.installments inst on inst.loan_id = l.id
  where inst.status in ('pending', 'partial', 'late') and inst.due_date < current_date;

  -- one contract per loan (mirrors the credit lifecycle)
  for v_loan in select * from public.loans loop
    v_contract_status := case v_loan.status
      when 'paid_off' then 'completed'
      when 'cancelled' then 'cancelled'
      else 'active' end;
    v_signed := (v_loan.start_date - interval '3 days');
    insert into public.contracts
      (client_id, loan_id, product_id, status, principal_amount, annual_rate, duration_months, monthly_payment,
       offer_sent_at, offer_expires_on, signed_at, signature_method, withdrawal_deadline, start_date, end_date)
    values
      (v_loan.client_id, v_loan.id, v_loan.product_id, v_contract_status,
       v_loan.principal_amount, v_loan.annual_rate, v_loan.duration_months, v_loan.monthly_payment,
       v_signed - interval '4 days', (v_loan.start_date - 1)::date, v_signed, 'e_sign',
       (v_signed + interval '14 days')::date, v_loan.start_date, v_loan.end_date);
  end loop;

  -- enrich existing applications with a source + score
  update public.loan_applications
    set source = coalesce(source, (array['website','simulator','referral','phone'])[1 + (abs(hashtext(id::text)) % 4)]),
        score = coalesce(score, 50 + (abs(hashtext(id::text)) % 45)),
        score_category = coalesce(score_category,
          case when (50 + (abs(hashtext(id::text)) % 45)) >= 80 then 'A'
               when (50 + (abs(hashtext(id::text)) % 45)) >= 65 then 'B'
               when (50 + (abs(hashtext(id::text)) % 45)) >= 50 then 'C' else 'D' end)
    where score is null;

  -- a few more applications spanning every pipeline stage (with KYC fields filled)
  select count(*) into v_app_count from public.loan_applications;
  if v_app_count < 14 then
    insert into public.loan_applications
      (status, credit_type, amount, duration, monthly_payment, effective_rate, country,
       first_name, last_name, birth_date, marital_status, email, phone, address, postal_code, city,
       employer_name, job_title, contract_type, monthly_net_income, source, score, score_category,
       document_id_url, document_income_url, document_address_url, document_bank_url)
    values
      ('qualified','consumer',4500,30,170.00,11.5,'EE','Kristjan','Lepik','1991-04-12','single',
        'kristjan.lepik@example.com','+372 5551201','Pikk 12','10133','Tallinn','Nortal','Developer','cdi',2900,'simulator',82,'A',
        'https://docs.example.com/app1/id.pdf','https://docs.example.com/app1/income.pdf','https://docs.example.com/app1/address.pdf','https://docs.example.com/app1/bank.pdf'),
      ('under_review','professional',12000,24,560.00,10.5,'FR','Pauline','Roussel','1986-09-03','married',
        'pauline.roussel@example.com','+33 612000111','Rue Victor Hugo 5','69002','Lyon','Indépendante','Consultante','freelance',3800,'website',71,'B',
        'https://docs.example.com/app2/id.pdf','https://docs.example.com/app2/income.pdf',null,'https://docs.example.com/app2/bank.pdf'),
      ('submitted','micro-credit',350,3,123.00,18.0,'EE','Mehdi','Vaher','1999-12-20','single',
        'mehdi.vaher@example.com','+372 5551203','Tartu mnt 8','10115','Tallinn','Bolt','Courier','cdd',1500,'phone',58,'C',
        null,null,null,null),
      ('qualified','student',3000,36,95.00,8.0,'EE','Clara','Raud','2002-06-15','single',
        'clara.raud@example.com','+372 5551204','Riia 4','51010','Tartu','Ülikool','Étudiante','student',700,'referral',55,'C',
        'https://docs.example.com/app4/id.pdf',null,'https://docs.example.com/app4/address.pdf',null),
      ('rejected','consumer',9000,48,250.00,16.0,'ES','Diego','Garcia','1980-02-28','divorced',
        'diego.garcia@example.com','+34 600999888','Calle Mayor 10','28013','Madrid','—','—','unemployed',1100,'website',38,'D',
        'https://docs.example.com/app5/id.pdf',null,null,null),
      ('cancelled','salary-advance',600,2,310.00,14.0,'EE','Jaan','Sepp','1994-07-07','single',
        'jaan.sepp@example.com','+372 5551206','Narva mnt 2','10120','Tallinn','Telia','Technician','cdi',2400,'simulator',76,'B',
        null,null,null,null);
  end if;

  raise notice 'CRM seed complete: % scores, % documents, % interactions, % tasks, % contracts',
    (select count(*) from public.client_scores),
    (select count(*) from public.client_documents),
    (select count(*) from public.interactions),
    (select count(*) from public.tasks),
    (select count(*) from public.contracts);
end;
$$;
