-- ============================================================================
-- Quickfund — Mailbox smoke data (business accounts + folders + conversations)
-- Mockup data (no real SMTP/IMAP). Idempotent: accounts via ON CONFLICT,
-- folders via unique(account_id,path), conversations guarded by the 'smk-%'
-- thread_key marker. Safe to re-run. Apply with the Management API (see
-- CLAUDE.md §12.3). Smoke threads are namespaced 'smk-*'.
-- ============================================================================

-- 1) Existing UI-created account: fill its smoke IMAP/SMTP config ------------
update public.mail_accounts set
  display_name = E'Quickfund — Contact',
  signature = E'Cordialement,\nL''équipe Quickfund — Contact\ncontact@quickfund.ee · quickfund.ee',
  imap_host = 'imap.quickfund.ee', imap_port = 993, imap_security = 'ssl',
  imap_username = 'contact@quickfund.ee', imap_password = 'app-password-demo',
  smtp_host = 'smtp.quickfund.ee', smtp_port = 587, smtp_security = 'starttls',
  smtp_username = 'contact@quickfund.ee', smtp_password = 'app-password-demo',
  is_active = true, is_default = true, last_synced_at = now() - interval '9 minutes',
  last_smtp_status = 'ok', last_smtp_checked_at = now() - interval '9 minutes',
  last_smtp_detail = 'Connexion SMTP réussie — 587/starttls.',
  last_imap_status = 'ok', last_imap_checked_at = now() - interval '9 minutes',
  last_imap_detail = 'Connexion IMAP réussie — 993/ssl, INBOX accessible.'
where email = 'contact@quickfund.ee';

-- 2) New business accounts (idempotent by unique email) ---------------------
insert into public.mail_accounts
  (label, email, display_name, signature,
   imap_host, imap_port, imap_security, imap_username, imap_password,
   smtp_host, smtp_port, smtp_security, smtp_username, smtp_password,
   is_active, is_default, last_synced_at,
   last_smtp_status, last_smtp_checked_at, last_smtp_detail,
   last_imap_status, last_imap_checked_at, last_imap_detail)
values
  (E'Support', E'support@quickfund.fr', E'Quickfund — Support', E'Cordialement,\nL''équipe Quickfund — Support client\nsupport@quickfund.fr · quickfund.fr',
   'imap.quickfund.fr', 993, 'ssl', E'support@quickfund.fr', 'app-password-demo',
   'smtp.quickfund.fr', 587, 'starttls', E'support@quickfund.fr', 'app-password-demo',
   true, false, now() - interval '15 minutes',
   'ok', now() - interval '15 minutes', E'Connexion SMTP réussie — 587/starttls.',
   'ok', now() - interval '15 minutes', E'Connexion IMAP réussie — 993/ssl, INBOX accessible.'),
  (E'Recouvrement', E'recouvrement@quickfund.fr', E'Quickfund — Recouvrement', E'Cordialement,\nL''équipe Quickfund — Recouvrement\nrecouvrement@quickfund.fr · quickfund.fr',
   'imap.quickfund.fr', 993, 'ssl', E'recouvrement@quickfund.fr', 'app-password-demo',
   'smtp.quickfund.fr', 587, 'starttls', E'recouvrement@quickfund.fr', 'app-password-demo',
   true, false, now() - interval '15 minutes',
   'ok', now() - interval '15 minutes', E'Connexion SMTP réussie — 587/starttls.',
   'ok', now() - interval '15 minutes', E'Connexion IMAP réussie — 993/ssl, INBOX accessible.'),
  (E'Comptabilité', E'comptabilite@quickfund.fr', E'Quickfund — Comptabilité', E'Cordialement,\nL''équipe Quickfund — Comptabilité\ncomptabilite@quickfund.fr · quickfund.fr',
   'imap.quickfund.fr', 993, 'ssl', E'comptabilite@quickfund.fr', 'app-password-demo',
   'smtp.quickfund.fr', 587, 'starttls', E'comptabilite@quickfund.fr', 'app-password-demo',
   true, false, now() - interval '15 minutes',
   'error', now() - interval '15 minutes', E'Échec SMTP — authentification refusée (535).',
   'ok', now() - interval '15 minutes', E'Connexion IMAP réussie — 993/ssl, INBOX accessible.'),
  (E'Commercial', E'commercial@quickfund.eu', E'Quickfund — Commercial', E'Cordialement,\nL''équipe Quickfund — Commercial\ncommercial@quickfund.eu · quickfund.eu',
   'imap.quickfund.eu', 993, 'ssl', E'commercial@quickfund.eu', 'app-password-demo',
   'smtp.quickfund.eu', 587, 'starttls', E'commercial@quickfund.eu', 'app-password-demo',
   true, false, now() - interval '15 minutes',
   'ok', now() - interval '15 minutes', E'Connexion SMTP réussie — 587/starttls.',
   'ok', now() - interval '15 minutes', E'Connexion IMAP réussie — 993/ssl, INBOX accessible.'),
  (E'Partenariats', E'partenariats@quickfund.eu', E'Quickfund — Partenariats', E'Cordialement,\nL''équipe Quickfund — Partenariats\npartenariats@quickfund.eu · quickfund.eu',
   'imap.quickfund.eu', 993, 'ssl', E'partenariats@quickfund.eu', 'app-password-demo',
   'smtp.quickfund.eu', 587, 'starttls', E'partenariats@quickfund.eu', 'app-password-demo',
   true, false, now() - interval '15 minutes',
   'ok', now() - interval '15 minutes', E'Connexion SMTP réussie — 587/starttls.',
   'unknown', null, null),
  (E'Direction', E'direction@quickfund.ee', E'Quickfund — Direction', E'Cordialement,\nL''équipe Quickfund — Direction\ndirection@quickfund.ee · quickfund.ee',
   'imap.quickfund.ee', 993, 'ssl', E'direction@quickfund.ee', 'app-password-demo',
   'smtp.quickfund.ee', 587, 'starttls', E'direction@quickfund.ee', 'app-password-demo',
   true, false, now() - interval '15 minutes',
   'ok', now() - interval '15 minutes', E'Connexion SMTP réussie — 587/starttls.',
   'ok', now() - interval '15 minutes', E'Connexion IMAP réussie — 993/ssl, INBOX accessible.')
on conflict (email) do nothing;

-- 3) Folders: standard 4 for every account, +Archive/+Spam for contact/support
insert into public.mail_folders (account_id, name, path, role, sort_order)
select a.id, v.name, v.path, v.role, v.sort_order
from (values
  ('Réception','INBOX','inbox',0),
  ('Envoyés','INBOX.Sent','sent',1),
  ('Brouillons','INBOX.Drafts','drafts',2),
  ('Corbeille','INBOX.Trash','trash',3)
) as v(name,path,role,sort_order)
cross join public.mail_accounts a
on conflict (account_id, path) do nothing;
insert into public.mail_folders (account_id, name, path, role, sort_order)
select a.id, v.name, v.path, v.role, v.sort_order
from (values
  ('Archive','INBOX.Archive','archive',4),
  ('Indésirables','INBOX.Spam','spam',5)
) as v(name,path,role,sort_order)
cross join (select id from public.mail_accounts
            where email in ('contact@quickfund.ee','support@quickfund.fr')) a
on conflict (account_id, path) do nothing;

-- 4) Conversations (guarded: only when no 'smk-%' thread exists yet) ---------
-- 4a) Diagnostics first (same guard, inserted before messages exist).
insert into public.mail_diagnostics (account_id, kind, ok, detail, latency_ms, ran_at)
select a.id, v.kind, v.ok, v.detail, v.latency_ms, v.ran_at
from (values
  (E'contact@quickfund.ee', 'imap', true, E'Connexion IMAP réussie — 993/ssl, INBOX accessible.', 540, (now() - interval '9 minutes')::timestamptz),
  (E'contact@quickfund.ee', 'smtp', true, E'Connexion SMTP réussie — 587/starttls.', 612, (now() - interval '9 minutes')::timestamptz),
  (E'contact@quickfund.ee', 'smtp', false, E'Échec SMTP — délai d''attente dépassé sur le port 587.', 3010, (now() - interval '3 days')::timestamptz),
  (E'support@quickfund.fr', 'imap', true, E'Connexion IMAP réussie — 993/ssl, INBOX accessible.', 498, (now() - interval '15 minutes')::timestamptz),
  (E'support@quickfund.fr', 'smtp', true, E'Connexion SMTP réussie — 587/starttls.', 605, (now() - interval '15 minutes')::timestamptz),
  (E'recouvrement@quickfund.fr', 'smtp', true, E'Connexion SMTP réussie — 587/starttls.', 560, (now() - interval '15 minutes')::timestamptz),
  (E'comptabilite@quickfund.fr', 'smtp', false, E'Échec SMTP — authentification refusée (535).', 420, (now() - interval '15 minutes')::timestamptz),
  (E'comptabilite@quickfund.fr', 'imap', true, E'Connexion IMAP réussie — 993/ssl, INBOX accessible.', 512, (now() - interval '15 minutes')::timestamptz),
  (E'commercial@quickfund.eu', 'imap', true, E'Connexion IMAP réussie — 993/ssl, INBOX accessible.', 533, (now() - interval '15 minutes')::timestamptz),
  (E'partenariats@quickfund.eu', 'smtp', true, E'Connexion SMTP réussie — 587/starttls.', 588, (now() - interval '15 minutes')::timestamptz),
  (E'direction@quickfund.ee', 'imap', true, E'Connexion IMAP réussie — 993/ssl, INBOX accessible.', 470, (now() - interval '15 minutes')::timestamptz)
) as v(account_email, kind, ok, detail, latency_ms, ran_at)
join public.mail_accounts a on a.email = v.account_email
where not exists (select 1 from public.mail_messages where thread_key like 'smk-%');

-- 4b) Messages.
insert into public.mail_messages
  (account_id, folder_id, direction, message_id, in_reply_to, thread_key,
   from_name, from_address, to_addresses, subject, snippet, body_text,
   has_attachments, size_bytes, is_seen, is_flagged, is_answered, status, received_at, sent_at)
select a.id, f.id, v.direction, v.message_id, v.in_reply_to, v.thread_key,
   v.from_name, v.from_address, v.to_addresses, v.subject, v.snippet, v.body_text,
   v.has_attachments, v.size_bytes, v.is_seen, v.is_flagged, v.is_answered, v.status, v.received_at, v.sent_at
from (values
  (E'contact@quickfund.ee', 'inbox', 'in', E'<smk-info-conso-1@gmail.com>', null::text, E'smk-info-conso',
   E'Sophie Bernard', E'sophie.bernard@gmail.com', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Demande d''information — crédit conso', E'Bonjour, je souhaite financer des travaux (~4 000 €). Quelles sont vos conditions et la durée maximale ?', E'Bonjour,\n\nJe souhaite financer des travaux pour environ 4 000 €. Pourriez-vous m''indiquer vos conditions (taux, durée maximale, frais de dossier) et la marche à suivre pour déposer une demande ?\n\nCordialement,\nSophie Bernard',
   false, 8192, false, false, true, 'received', (now() - interval '2 hours')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'sent', 'out', E'<smk-info-conso-2@quickfund.ee>', E'<smk-info-conso-1@gmail.com>', E'smk-info-conso',
   E'Quickfund — Contact', E'contact@quickfund.ee', '[{"name": "Sophie Bernard", "address": "sophie.bernard@gmail.com"}]'::jsonb, E'Re: Demande d''information — crédit conso', E'Bonjour Sophie, pour un crédit conso de 4 000 € nos durées vont de 3 à 36 mois, taux à partir de 6 %…', E'Bonjour Sophie,\n\nMerci de votre intérêt. Pour un crédit à la consommation de 4 000 €, nos durées s''échelonnent de 3 à 36 mois, avec un taux à partir de 6 % et des frais de dossier de 1 %.\n\nVous pouvez déposer votre demande en ligne sur quickfund.eu ; un conseiller l''étudie sous 48 h.\n\nCordialement,\nL''équipe Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '1 hour')::timestamptz),
  (E'contact@quickfund.ee', 'inbox', 'in', E'<smk-docs-kyc-1@gmail.com>', null::text, E'smk-docs-kyc',
   E'Liis Tamm', E'liis.tamm@gmail.com', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Pièces justificatives pour ma demande', E'Bonjour, vous trouverez ci-joint ma pièce d''identité et mon dernier bulletin de salaire…', E'Bonjour,\n\nSuite à votre message, vous trouverez ci-joint ma pièce d''identité ainsi que mon dernier bulletin de salaire. N''hésitez pas si un autre document est nécessaire.\n\nBien à vous,\nLiis Tamm',
   true, 104192, false, true, true, 'received', (now() - interval '6 hours')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'sent', 'out', E'<smk-docs-kyc-2@quickfund.ee>', E'<smk-docs-kyc-1@gmail.com>', E'smk-docs-kyc',
   E'Quickfund — Contact', E'contact@quickfund.ee', '[{"name": "Liis Tamm", "address": "liis.tamm@gmail.com"}]'::jsonb, E'Re: Pièces justificatives pour ma demande', E'Bonjour Liis, merci pour l''envoi. Vos documents sont bien reçus, il nous manque un justificatif de domicile…', E'Bonjour Liis,\n\nMerci pour l''envoi de vos pièces, elles sont bien reçues. Pour finaliser l''étude de votre demande, il nous manque un justificatif de domicile de moins de trois mois.\n\nDès réception, nous reviendrons vers vous sous 48 h.\n\nCordialement,\nL''équipe Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '5 hours')::timestamptz),
  (E'contact@quickfund.ee', 'inbox', 'in', E'<smk-anticipe-1@outlook.fr>', null::text, E'smk-anticipe',
   E'Jean Mercier', E'jean.mercier@outlook.fr', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Remboursement anticipé possible ?', E'Bonjour, je rembourse actuellement un crédit chez vous. Est-il possible de solder par anticipation ?', E'Bonjour,\n\nJe rembourse actuellement un crédit souscrit chez vous. Est-il possible de le solder par anticipation, et si oui, quels seraient les frais éventuels ?\n\nMerci pour votre retour,\nJean Mercier',
   false, 8192, false, false, false, 'received', (now() - interval '1 day')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'inbox', 'in', E'<smk-sepa-1@bank-partner.ee>', null::text, E'smk-sepa',
   E'Banque partenaire', E'notifications@bank-partner.ee', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Confirmation de virement SEPA — réf. SEPA-8842', E'Le virement SEPA réf. SEPA-8842 d''un montant de 3 000,00 € a été exécuté avec succès.', E'Bonjour,\n\nNous vous confirmons l''exécution du virement SEPA suivant :\n\nRéférence : SEPA-8842\nMontant : 3 000,00 €\nDate de valeur : ce jour\n\nLe détail figure dans la pièce jointe.\n\nCordialement,\nService virements',
   true, 73728, true, false, false, 'received', (now() - interval '1 day 6 hours')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'inbox', 'in', E'<smk-rgpd-1@free.fr>', null::text, E'smk-rgpd',
   E'Marc Petit', E'marc.petit@free.fr', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Demande d''accès à mes données personnelles (RGPD)', E'Bonjour, conformément au RGPD je souhaite obtenir une copie des données me concernant…', E'Bonjour,\n\nConformément au Règlement général sur la protection des données (article 15), je souhaite obtenir une copie de l''ensemble des données personnelles que vous détenez me concernant.\n\nMerci de me confirmer la bonne réception de ma demande.\n\nCordialement,\nMarc Petit',
   false, 8192, false, true, false, 'received', (now() - interval '2 days')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'inbox', 'in', E'<smk-rdv-1@icloud.com>', null::text, E'smk-rdv',
   E'Camille Roux', E'camille.roux@icloud.com', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Confirmation de rendez-vous conseiller', E'Bonjour, je confirme notre rendez-vous téléphonique de jeudi à 14 h. Bonne journée.', E'Bonjour,\n\nJe vous confirme notre rendez-vous téléphonique prévu jeudi à 14 h pour faire le point sur mon dossier de financement.\n\nBonne journée,\nCamille Roux',
   false, 8192, true, false, true, 'received', (now() - interval '3 days')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'sent', 'out', E'<smk-rdv-2@quickfund.ee>', E'<smk-rdv-1@icloud.com>', E'smk-rdv',
   E'Quickfund — Contact', E'contact@quickfund.ee', '[{"name": "Camille Roux", "address": "camille.roux@icloud.com"}]'::jsonb, E'Re: Confirmation de rendez-vous conseiller', E'Bonjour Camille, c''est noté pour jeudi 14 h. Un conseiller vous appellera sur votre numéro habituel…', E'Bonjour Camille,\n\nC''est bien noté pour jeudi à 14 h. Un conseiller vous appellera sur votre numéro habituel. Pensez à avoir vos derniers justificatifs de revenus à portée de main.\n\nÀ jeudi,\nL''équipe Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '3 days')::timestamptz),
  (E'contact@quickfund.ee', 'spam', 'in', E'<smk-phishing-1@paypa1-secure.com>', null::text, E'smk-phishing',
   E'Service Sécurité', E'security@paypa1-secure.com', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'URGENT : votre compte sera suspendu', E'Cher client, nous avons détecté une activité suspecte. Cliquez ici pour vérifier votre compte sous 24 h…', E'Cher client,\n\nNous avons détecté une activité suspecte sur votre compte. Pour éviter sa suspension, veuillez confirmer vos informations en cliquant sur le lien ci-dessous dans les 24 heures.\n\nhttp://paypa1-secure.com/verify\n\nLe service sécurité',
   false, 8192, false, false, false, 'received', (now() - interval '1 day 3 hours')::timestamptz, null::timestamptz),
  (E'contact@quickfund.ee', 'archive', 'in', E'<smk-merci-1@orange.fr>', null::text, E'smk-merci',
   E'Patrick Noël', E'patrick.noel@orange.fr', '[{"name": "Quickfund — Contact", "address": "contact@quickfund.ee"}]'::jsonb, E'Remerciements — dossier financé', E'Un grand merci à toute l''équipe, les fonds ont bien été débloqués hier. Service au top !', E'Bonjour,\n\nUn grand merci à toute l''équipe : les fonds ont bien été débloqués hier. Le suivi a été parfait du début à la fin, je recommanderai Quickfund autour de moi.\n\nBien cordialement,\nPatrick Noël',
   false, 8192, true, false, false, 'received', (now() - interval '8 days')::timestamptz, null::timestamptz),
  (E'support@quickfund.fr', 'inbox', 'in', E'<smk-login-1@orange.fr>', null::text, E'smk-login',
   E'Thomas Leroy', E'thomas.leroy@orange.fr', '[{"name": "Quickfund — Support", "address": "support@quickfund.fr"}]'::jsonb, E'Impossible de me connecter à mon espace client', E'Bonjour, depuis ce matin je n''arrive plus à accéder à mon espace, mot de passe refusé…', E'Bonjour,\n\nDepuis ce matin, je n''arrive plus à me connecter à mon espace client : mon mot de passe est systématiquement refusé, et la réinitialisation ne m''envoie aucun e-mail.\n\nPouvez-vous m''aider ?\n\nMerci,\nThomas Leroy',
   false, 8192, false, false, true, 'received', (now() - interval '4 hours')::timestamptz, null::timestamptz),
  (E'support@quickfund.fr', 'sent', 'out', E'<smk-login-2@quickfund.fr>', E'<smk-login-1@orange.fr>', E'smk-login',
   E'Quickfund — Support', E'support@quickfund.fr', '[{"name": "Thomas Leroy", "address": "thomas.leroy@orange.fr"}]'::jsonb, E'Re: Impossible de me connecter à mon espace client', E'Bonjour Thomas, nous avons renvoyé un lien de réinitialisation. Pensez à vérifier vos courriers indésirables…', E'Bonjour Thomas,\n\nNous venons de renvoyer un lien de réinitialisation à cette adresse. Merci de vérifier votre dossier de courriers indésirables. Le lien est valable 1 heure.\n\nTenez-nous au courant si le souci persiste.\n\nCordialement,\nLe support Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '3 hours')::timestamptz),
  (E'support@quickfund.fr', 'inbox', 'in', E'<smk-echeancier-1@gmail.com>', null::text, E'smk-echeancier',
   E'Nadia Khelifi', E'nadia.khelifi@gmail.com', '[{"name": "Quickfund — Support", "address": "support@quickfund.fr"}]'::jsonb, E'Téléchargement de mon échéancier', E'Bonjour, où puis-je télécharger l''échéancier complet de mon crédit ? Merci.', E'Bonjour,\n\nJe ne retrouve pas l''échéancier complet de mon crédit dans mon espace. Pourriez-vous me l''envoyer ou m''indiquer où le télécharger ?\n\nMerci d''avance,\nNadia Khelifi',
   false, 8192, true, false, true, 'received', (now() - interval '1 day 2 hours')::timestamptz, null::timestamptz),
  (E'support@quickfund.fr', 'sent', 'out', E'<smk-echeancier-2@quickfund.fr>', E'<smk-echeancier-1@gmail.com>', E'smk-echeancier',
   E'Quickfund — Support', E'support@quickfund.fr', '[{"name": "Nadia Khelifi", "address": "nadia.khelifi@gmail.com"}]'::jsonb, E'Re: Téléchargement de mon échéancier', E'Bonjour Nadia, vous trouverez votre échéancier en pièce jointe. Il est aussi disponible dans Mon espace > Documents…', E'Bonjour Nadia,\n\nVous trouverez votre échéancier complet en pièce jointe. Il reste également disponible à tout moment dans Mon espace > Documents.\n\nBonne réception,\nLe support Quickfund',
   true, 86016, true, false, false, 'sent', null::timestamptz, (now() - interval '1 day')::timestamptz),
  (E'support@quickfund.fr', 'inbox', 'in', E'<smk-assurance-1@sfr.fr>', null::text, E'smk-assurance',
   E'Paul Girard', E'paul.girard@sfr.fr', '[{"name": "Quickfund — Support", "address": "support@quickfund.fr"}]'::jsonb, E'Question sur l''assurance emprunteur', E'Bonjour, l''assurance emprunteur est-elle obligatoire pour mon crédit conso ? Puis-je la résilier ?', E'Bonjour,\n\nL''assurance emprunteur est-elle obligatoire pour mon crédit à la consommation ? Si je l''ai souscrite, puis-je la résilier en cours de contrat ?\n\nMerci pour vos précisions,\nPaul Girard',
   false, 8192, false, false, false, 'received', (now() - interval '2 days 5 hours')::timestamptz, null::timestamptz),
  (E'support@quickfund.fr', 'inbox', 'in', E'<smk-coords-1@yahoo.fr>', null::text, E'smk-coords',
   E'Émilie Moreau', E'emilie.moreau@yahoo.fr', '[{"name": "Quickfund — Support", "address": "support@quickfund.fr"}]'::jsonb, E'Changement de coordonnées bancaires', E'Bonjour, j''ai changé de banque. Comment mettre à jour mon RIB pour les prélèvements ?', E'Bonjour,\n\nJ''ai récemment changé de banque et je souhaite mettre à jour le RIB utilisé pour les prélèvements de mon crédit. Quelle est la procédure et le délai de prise en compte ?\n\nCordialement,\nÉmilie Moreau',
   false, 8192, true, false, true, 'received', (now() - interval '3 days')::timestamptz, null::timestamptz),
  (E'support@quickfund.fr', 'sent', 'out', E'<smk-coords-2@quickfund.fr>', E'<smk-coords-1@yahoo.fr>', E'smk-coords',
   E'Quickfund — Support', E'support@quickfund.fr', '[{"name": "Émilie Moreau", "address": "emilie.moreau@yahoo.fr"}]'::jsonb, E'Re: Changement de coordonnées bancaires', E'Bonjour Émilie, transmettez-nous votre nouveau RIB depuis Mon espace > Coordonnées. La prise en compte est sous 5 jours…', E'Bonjour Émilie,\n\nPour mettre à jour votre RIB, rendez-vous dans Mon espace > Coordonnées bancaires et téléversez votre nouveau RIB. La prise en compte intervient sous 5 jours ouvrés ; le prélèvement en cours reste sur l''ancien compte s''il est à moins de 8 jours.\n\nCordialement,\nLe support Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '2 days 20 hours')::timestamptz),
  (E'support@quickfund.fr', 'inbox', 'in', E'<smk-appmobile-1@hotmail.com>', null::text, E'smk-appmobile',
   E'Lucas Blanc', E'lucas.blanc@hotmail.com', '[{"name": "Quickfund — Support", "address": "support@quickfund.fr"}]'::jsonb, E'Bug sur l''application mobile', E'L''appli plante à l''ouverture depuis la dernière mise à jour (iPhone 13, iOS 18). Écran blanc.', E'Bonjour,\n\nDepuis la dernière mise à jour, l''application plante à l''ouverture : écran blanc puis fermeture. Je suis sur iPhone 13 sous iOS 18.\n\nMerci de regarder,\nLucas Blanc',
   false, 8192, false, true, false, 'received', (now() - interval '5 hours')::timestamptz, null::timestamptz),
  (E'recouvrement@quickfund.fr', 'sent', 'out', E'<smk-relance-1@quickfund.fr>', null::text, E'smk-relance',
   E'Quickfund — Recouvrement', E'recouvrement@quickfund.fr', '[{"name": "Antoine Dubois", "address": "antoine.dubois@gmail.com"}]'::jsonb, E'Relance — échéance impayée du 5', E'Bonjour, l''échéance du 5 de votre crédit n''a pas pu être prélevée. Merci de régulariser sous 8 jours…', E'Bonjour Monsieur Dubois,\n\nNous constatons que l''échéance du 5 de votre crédit (mensualité de 187,40 €) n''a pas pu être prélevée. Nous vous invitons à régulariser la situation sous 8 jours pour éviter des frais de rejet.\n\nVous pouvez payer en ligne ou nous contacter pour convenir d''une solution.\n\nCordialement,\nLe service recouvrement',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '4 days')::timestamptz),
  (E'recouvrement@quickfund.fr', 'inbox', 'in', E'<smk-relance-2@gmail.com>', E'<smk-relance-1@quickfund.fr>', E'smk-relance',
   E'Antoine Dubois', E'antoine.dubois@gmail.com', '[{"name": "Quickfund — Recouvrement", "address": "recouvrement@quickfund.fr"}]'::jsonb, E'Re: Relance — échéance impayée du 5', E'Bonjour, désolé pour ce retard, un imprévu. Je régularise vendredi à réception de mon salaire.', E'Bonjour,\n\nJe suis désolé pour ce retard, dû à un imprévu. Je régularise l''échéance vendredi dès réception de mon salaire. Merci de votre compréhension.\n\nCordialement,\nAntoine Dubois',
   false, 8192, true, false, false, 'received', (now() - interval '3 days 20 hours')::timestamptz, null::timestamptz),
  (E'recouvrement@quickfund.fr', 'inbox', 'in', E'<smk-delai-1@outlook.fr>', null::text, E'smk-delai',
   E'Fatima Benali', E'fatima.benali@outlook.fr', '[{"name": "Quickfund — Recouvrement", "address": "recouvrement@quickfund.fr"}]'::jsonb, E'Demande de délai de paiement', E'Bonjour, suite à une baisse de revenus, puis-je reporter mes deux prochaines mensualités ?', E'Bonjour,\n\nSuite à une baisse temporaire de mes revenus, je rencontre des difficultés. Serait-il possible de reporter mes deux prochaines mensualités en fin de prêt, ou de mettre en place un échéancier adapté ?\n\nMerci de votre aide,\nFatima Benali',
   false, 8192, false, true, true, 'received', (now() - interval '2 days')::timestamptz, null::timestamptz),
  (E'recouvrement@quickfund.fr', 'sent', 'out', E'<smk-delai-2@quickfund.fr>', E'<smk-delai-1@outlook.fr>', E'smk-delai',
   E'Quickfund — Recouvrement', E'recouvrement@quickfund.fr', '[{"name": "Fatima Benali", "address": "fatima.benali@outlook.fr"}]'::jsonb, E'Re: Demande de délai de paiement', E'Bonjour Madame Benali, nous pouvons proposer un report de 2 mensualités. Un avenant vous sera adressé…', E'Bonjour Madame Benali,\n\nNous comprenons votre situation. Nous pouvons proposer un report de vos 2 prochaines mensualités en fin de prêt, sans frais. Un avenant vous sera adressé pour signature électronique.\n\nN''hésitez pas à nous appeler pour en discuter.\n\nCordialement,\nLe service recouvrement',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '1 day 18 hours')::timestamptz),
  (E'recouvrement@quickfund.fr', 'inbox', 'in', E'<smk-litige-1@gmail.com>', null::text, E'smk-litige',
   E'Sandra Lopez', E'sandra.lopez@gmail.com', '[{"name": "Quickfund — Recouvrement", "address": "recouvrement@quickfund.fr"}]'::jsonb, E'Contestation de frais de retard', E'Bonjour, je conteste les 25 € de frais : le prélèvement a échoué à cause d''une erreur de votre côté…', E'Bonjour,\n\nJe conteste les 25 € de frais de rejet appliqués ce mois-ci. Le prélèvement a échoué en raison d''une erreur de référence de votre côté, ma provision étant suffisante. Je demande l''annulation de ces frais.\n\nDans l''attente,\nSandra Lopez',
   false, 8192, false, true, false, 'received', (now() - interval '1 day 4 hours')::timestamptz, null::timestamptz),
  (E'comptabilite@quickfund.fr', 'inbox', 'in', E'<smk-facture-ovh-1@ovh.com>', null::text, E'smk-facture-ovh',
   E'OVHcloud', E'facturation@ovh.com', '[{"name": "Quickfund — Comptabilité", "address": "comptabilite@quickfund.fr"}]'::jsonb, E'Votre facture OVHcloud — mars 2026', E'Votre facture n° FR-2026-0398421 d''un montant de 142,80 € TTC est disponible.', E'Bonjour,\n\nVotre facture OVHcloud n° FR-2026-0398421 d''un montant de 142,80 € TTC est disponible dans votre espace client. Le prélèvement interviendra sous 10 jours.\n\nCordialement,\nLe service facturation OVHcloud',
   true, 62402, true, false, false, 'received', (now() - interval '2 days 8 hours')::timestamptz, null::timestamptz),
  (E'comptabilite@quickfund.fr', 'inbox', 'in', E'<smk-urssaf-1@urssaf.fr>', null::text, E'smk-urssaf',
   E'URSSAF', E'noreply@urssaf.fr', '[{"name": "Quickfund — Comptabilité", "address": "comptabilite@quickfund.fr"}]'::jsonb, E'Avis d''échéance — cotisations 1er trimestre', E'Votre avis d''échéance de cotisations sociales est disponible. Date limite de paiement : le 15.', E'Bonjour,\n\nVotre avis d''échéance de cotisations sociales pour le 1er trimestre est disponible dans votre espace. La date limite de paiement est fixée au 15 du mois.\n\nCordialement,\nL''URSSAF',
   false, 8192, false, false, false, 'received', (now() - interval '3 days 6 hours')::timestamptz, null::timestamptz),
  (E'comptabilite@quickfund.fr', 'inbox', 'in', E'<smk-relance-fourn-1@papeteriepro.fr>', null::text, E'smk-relance-fourn',
   E'Papeterie Pro', E'compta@papeteriepro.fr', '[{"name": "Quickfund — Comptabilité", "address": "comptabilite@quickfund.fr"}]'::jsonb, E'Relance — facture n° 2026-114 impayée', E'Bonjour, sauf erreur, notre facture n° 2026-114 (320,00 €) reste impayée à ce jour…', E'Bonjour,\n\nSauf erreur de notre part, notre facture n° 2026-114 d''un montant de 320,00 € TTC reste impayée à ce jour. Merci de bien vouloir procéder au règlement ou de nous indiquer la date prévue.\n\nCordialement,\nPapeterie Pro',
   false, 8192, false, false, false, 'received', (now() - interval '1 day 9 hours')::timestamptz, null::timestamptz),
  (E'commercial@quickfund.eu', 'inbox', 'in', E'<smk-pro-devis-1@baticoncept.fr>', null::text, E'smk-pro-devis',
   E'SARL Bâti-Concept', E'contact@baticoncept.fr', '[{"name": "Quickfund — Commercial", "address": "commercial@quickfund.eu"}]'::jsonb, E'Demande de financement pro — devis matériel', E'Bonjour, nous souhaitons financer l''achat de matériel BTP (~28 000 €). Devis joint…', E'Bonjour,\n\nNous sommes une entreprise du BTP et souhaitons financer l''achat de matériel pour environ 28 000 €. Vous trouverez le devis du fournisseur en pièce jointe. Quelles solutions proposez-vous (crédit pro, leasing) ?\n\nCordialement,\nSARL Bâti-Concept',
   true, 126592, false, false, false, 'received', (now() - interval '6 hours')::timestamptz, null::timestamptz),
  (E'commercial@quickfund.eu', 'inbox', 'in', E'<smk-leasing-1@garagestella.eu>', null::text, E'smk-leasing',
   E'Garage Stella', E'info@garagestella.eu', '[{"name": "Quickfund — Commercial", "address": "commercial@quickfund.eu"}]'::jsonb, E'Leasing véhicule utilitaire', E'Bonjour, nous cherchons une LOA pour deux utilitaires. Pouvez-vous nous faire une simulation ?', E'Bonjour,\n\nNous cherchons une solution de location avec option d''achat pour deux véhicules utilitaires neufs. Pourriez-vous nous adresser une simulation sur 48 mois ?\n\nMerci,\nGarage Stella',
   false, 8192, true, false, true, 'received', (now() - interval '1 day 7 hours')::timestamptz, null::timestamptz),
  (E'commercial@quickfund.eu', 'sent', 'out', E'<smk-leasing-2@quickfund.eu>', E'<smk-leasing-1@garagestella.eu>', E'smk-leasing',
   E'Quickfund — Commercial', E'commercial@quickfund.eu', '[{"name": "Garage Stella", "address": "info@garagestella.eu"}]'::jsonb, E'Re: Leasing véhicule utilitaire', E'Bonjour, avec plaisir. Pour une LOA sur 48 mois, indiquez-nous le modèle et le prix HT des véhicules…', E'Bonjour,\n\nAvec plaisir. Pour établir une simulation de LOA sur 48 mois, merci de nous communiquer le modèle exact, le prix HT et l''apport éventuel pour chaque véhicule. Nous revenons vers vous sous 24 h avec une offre chiffrée.\n\nCordialement,\nLe service commercial Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '1 day 2 hours')::timestamptz),
  (E'commercial@quickfund.eu', 'inbox', 'in', E'<smk-regroupement-1@gmail.com>', null::text, E'smk-regroupement',
   E'Olivier Faure', E'olivier.faure@gmail.com', '[{"name": "Quickfund — Commercial", "address": "commercial@quickfund.eu"}]'::jsonb, E'Regroupement de crédits', E'Bonjour, j''ai 3 crédits en cours (~22 000 €). Est-il possible de les regrouper en une mensualité ?', E'Bonjour,\n\nJ''ai actuellement trois crédits en cours pour un total d''environ 22 000 €. Serait-il possible de les regrouper en une seule mensualité afin d''alléger mon budget mensuel ? Quelles pièces dois-je fournir ?\n\nCordialement,\nOlivier Faure',
   false, 8192, false, false, false, 'received', (now() - interval '2 days 3 hours')::timestamptz, null::timestamptz),
  (E'commercial@quickfund.eu', 'inbox', 'in', E'<smk-microcredit-1@gmail.com>', null::text, E'smk-microcredit',
   E'Aïcha Diallo', E'aicha.diallo@gmail.com', '[{"name": "Quickfund — Commercial", "address": "commercial@quickfund.eu"}]'::jsonb, E'Micro-crédit création d''activité', E'Bonjour, je lance une activité de couture et cherche un micro-crédit de 3 000 € pour le matériel…', E'Bonjour,\n\nJe lance une activité de couture à mon compte et recherche un micro-crédit de 3 000 € pour l''achat de machines. Je n''ai pas encore de bilan. Quelles sont les conditions d''éligibilité ?\n\nMerci,\nAïcha Diallo',
   false, 8192, true, false, true, 'received', (now() - interval '4 days')::timestamptz, null::timestamptz),
  (E'commercial@quickfund.eu', 'sent', 'out', E'<smk-microcredit-2@quickfund.eu>', E'<smk-microcredit-1@gmail.com>', E'smk-microcredit',
   E'Quickfund — Commercial', E'commercial@quickfund.eu', '[{"name": "Aïcha Diallo", "address": "aicha.diallo@gmail.com"}]'::jsonb, E'Re: Micro-crédit création d''activité', E'Bonjour Aïcha, le micro-crédit création est accessible sans bilan. Il faut un business plan simple et un garant…', E'Bonjour Aïcha,\n\nLe micro-crédit création est accessible sans bilan. Nous demandons un business plan simplifié, un justificatif d''identité et, selon le montant, un garant. Le taux est à partir de 4 % sur 12 à 36 mois.\n\nSouhaitez-vous que l''on planifie un rendez-vous ?\n\nCordialement,\nLe service commercial Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '3 days 18 hours')::timestamptz),
  (E'partenariats@quickfund.eu', 'inbox', 'in', E'<smk-apport-1@apporteur.fr>', null::text, E'smk-apport',
   E'Réseau Apporteurs', E'partenariats@apporteur.fr', '[{"name": "Quickfund — Partenariats", "address": "partenariats@quickfund.eu"}]'::jsonb, E'Proposition d''apport d''affaires', E'Bonjour, nous accompagnons des TPE en recherche de financement et souhaiterions échanger…', E'Bonjour,\n\nNous accompagnons des TPE en recherche de financement et serions intéressés par un partenariat d''apport d''affaires avec Quickfund. Seriez-vous disponible pour un échange cette semaine ?\n\nBien cordialement,\nRéseau Apporteurs',
   false, 8192, true, false, false, 'received', (now() - interval '3 days')::timestamptz, null::timestamptz),
  (E'partenariats@quickfund.eu', 'inbox', 'in', E'<smk-fintech-1@fintechconnect.eu>', null::text, E'smk-fintech',
   E'FinTech Connect', E'hello@fintechconnect.eu', '[{"name": "Quickfund — Partenariats", "address": "partenariats@quickfund.eu"}]'::jsonb, E'Intégration API partenaire', E'Bonjour, nous proposons une brique de scoring temps réel. Une intégration via API vous intéresserait-elle ?', E'Bonjour,\n\nNous éditons une brique de scoring crédit en temps réel et proposons une intégration via API à nos partenaires prêteurs. Cela pourrait-il enrichir votre processus d''octroi ? Nous pouvons organiser une démonstration.\n\nCordialement,\nFinTech Connect',
   false, 8192, false, false, true, 'received', (now() - interval '1 day 5 hours')::timestamptz, null::timestamptz),
  (E'partenariats@quickfund.eu', 'sent', 'out', E'<smk-fintech-2@quickfund.eu>', E'<smk-fintech-1@fintechconnect.eu>', E'smk-fintech',
   E'Quickfund — Partenariats', E'partenariats@quickfund.eu', '[{"name": "FinTech Connect", "address": "hello@fintechconnect.eu"}]'::jsonb, E'Re: Intégration API partenaire', E'Bonjour, merci pour votre message. Une démonstration nous intéresse — proposez-nous deux créneaux la semaine prochaine…', E'Bonjour,\n\nMerci pour votre message. Une démonstration nous intéresse en effet. Pourriez-vous nous proposer deux créneaux la semaine prochaine ? Merci également de joindre votre documentation technique (formats d''API, latence, RGPD).\n\nCordialement,\nLe service partenariats Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '1 day')::timestamptz),
  (E'partenariats@quickfund.eu', 'inbox', 'in', E'<smk-courtier-1@creditplus.fr>', null::text, E'smk-courtier',
   E'Cabinet Crédit Plus', E'contact@creditplus.fr', '[{"name": "Quickfund — Partenariats", "address": "partenariats@quickfund.eu"}]'::jsonb, E'Convention de courtage', E'Bonjour, courtiers en crédit, nous souhaitons signer une convention d''apporteur avec vos équipes…', E'Bonjour,\n\nNous sommes un cabinet de courtage en crédit et souhaitons établir une convention d''apporteur avec Quickfund. Pourriez-vous nous communiquer votre grille de commissionnement et les modalités de transmission des dossiers ?\n\nCordialement,\nCabinet Crédit Plus',
   false, 8192, true, false, false, 'received', (now() - interval '5 days')::timestamptz, null::timestamptz),
  (E'direction@quickfund.ee', 'inbox', 'in', E'<smk-board-1@nordic-capital.ee>', null::text, E'smk-board',
   E'Margus Kask', E'm.kask@nordic-capital.ee', '[{"name": "Quickfund — Direction", "address": "direction@quickfund.ee"}]'::jsonb, E'Réunion conseil — résultats Q2', E'Bonjour, pouvons-nous caler la réunion du conseil pour la revue des résultats du Q2 ?', E'Bonjour,\n\nEn vue de la revue des résultats du deuxième trimestre, pourrions-nous caler la prochaine réunion du conseil ? Je vous propose la semaine du 16. Merci de préparer le tableau de bord (encours, taux de défaut, acquisition).\n\nCordialement,\nMargus Kask\nNordic Capital',
   false, 8192, true, true, true, 'received', (now() - interval '2 days 2 hours')::timestamptz, null::timestamptz),
  (E'direction@quickfund.ee', 'sent', 'out', E'<smk-board-2@quickfund.ee>', E'<smk-board-1@nordic-capital.ee>', E'smk-board',
   E'Quickfund — Direction', E'direction@quickfund.ee', '[{"name": "Margus Kask", "address": "m.kask@nordic-capital.ee"}]'::jsonb, E'Re: Réunion conseil — résultats Q2', E'Bonjour Margus, la semaine du 16 nous convient. Je propose le mardi 17 à 10 h, support transmis en amont…', E'Bonjour Margus,\n\nLa semaine du 16 nous convient. Je propose le mardi 17 à 10 h (visioconférence). Le tableau de bord et le support seront transmis 48 h en amont.\n\nBien cordialement,\nLa direction Quickfund',
   false, 12288, true, false, false, 'sent', null::timestamptz, (now() - interval '1 day 22 hours')::timestamptz)
) as v(account_email, folder_role, direction, message_id, in_reply_to, thread_key,
       from_name, from_address, to_addresses, subject, snippet, body_text,
       has_attachments, size_bytes, is_seen, is_flagged, is_answered, status, received_at, sent_at)
join public.mail_accounts a on a.email = v.account_email
join public.mail_folders f on f.account_id = a.id and f.role = v.folder_role
where not exists (select 1 from public.mail_messages where thread_key like 'smk-%');

-- 4c) Attachments (linked by message_id; guarded by existing smoke attachments).
insert into public.mail_attachments (message_id, filename, content_type, size_bytes, is_inline)
select m.id, v.filename, v.content_type, v.size_bytes, v.is_inline
from (values
  (E'<smk-docs-kyc-1@gmail.com>', E'carte-identite.pdf', E'application/pdf', 96000, false),
  (E'<smk-docs-kyc-1@gmail.com>', E'bulletin-salaire.pdf', E'application/pdf', 88320, false),
  (E'<smk-sepa-1@bank-partner.ee>', E'avis-virement-sepa-8842.pdf', E'application/pdf', 65536, false),
  (E'<smk-echeancier-2@quickfund.fr>', E'echeancier-credit.pdf', E'application/pdf', 73728, false),
  (E'<smk-facture-ovh-1@ovh.com>', E'facture-FR-2026-0398421.pdf', E'application/pdf', 54210, false),
  (E'<smk-pro-devis-1@baticoncept.fr>', E'devis-materiel-btp.pdf', E'application/pdf', 118400, false)
) as v(msg_mid, filename, content_type, size_bytes, is_inline)
join public.mail_messages m on m.message_id = v.msg_mid
where not exists (
  select 1 from public.mail_attachments x
  join public.mail_messages mm on mm.id = x.message_id
  where mm.thread_key like 'smk-%');

