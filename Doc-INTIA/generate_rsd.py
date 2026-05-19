from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

for section in doc.sections:
    section.top_margin = section.bottom_margin = section.left_margin = section.right_margin = Cm(2.5)

doc.styles['Normal'].font.name = 'Arial'
doc.styles['Normal'].font.size = Pt(11)

def h(text, level=1):
    p = doc.add_heading(text, level=level)
    p.runs[0].font.name = 'Arial'
    p.runs[0].font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)

def p(text, bold=False):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.bold = bold
    run.font.size = Pt(11)

def tbl(headers, rows):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    for i, hdr in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = hdr
        c.paragraphs[0].runs[0].bold = True
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), '1a1a2e')
        c._tc.get_or_add_tcPr().append(shd)
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            c = t.rows[ri + 1].cells[ci]
            c.text = val
            if ri % 2 == 1:
                shd = OxmlElement('w:shd')
                shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), 'f0f0f0')
                c._tc.get_or_add_tcPr().append(shd)
    doc.add_paragraph()

def code(text):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.font.name = 'Courier New'
    run.font.size = Pt(9)
    par.paragraph_format.left_indent = Cm(1)
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), 'f5f5f5')
    par._p.get_or_add_pPr().append(shd)

# ── TITRE ─────────────────────────────────────────────────────
title = doc.add_heading('Document de Spécifications Techniques', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub = doc.add_paragraph('Plateforme de Gestion — INTIA Assurance')
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub.runs[0].bold = True; sub.runs[0].font.size = Pt(13)
meta = doc.add_paragraph('Version 2.0  |  Date : 19/05/2026\nAuteur : Développeur Full Stack — Test INTIA')
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
meta.runs[0].font.size = Pt(10); meta.runs[0].font.color.rgb = RGBColor(0x55,0x55,0x55)
doc.add_paragraph()

# ── 1. CONTEXTE ───────────────────────────────────────────────
h('1. Contexte & Objectif')
p("INTIA Assurance est une société disposant d'une Direction Générale et de deux succursales "
  "(INTIA-Douala, INTIA-Yaoundé). La plateforme web permet à ses employés (par agence) de gérer "
  "les dossiers clients et les contrats d'assurance. Les clients peuvent également s'authentifier "
  "pour consulter leurs propres contrats via un portail dédié.")

# ── 2. ACTEURS ────────────────────────────────────────────────
h('2. Acteurs')
tbl(
    ['Acteur', 'Type de compte', 'Authentification', 'Périmètre'],
    [
        ['Administrateur', 'Compte Employé (ADMIN)', 'Email + mot de passe → JWT', 'Toutes agences — gestion complète'],
        ['Agent',          'Compte Employé (AGENT)', 'Email + mot de passe → JWT', 'Son agence uniquement — CRUD clients & contrats'],
        ['Client',         'Compte Client',          'Email + mot de passe → JWT', 'Ses propres contrats — lecture seule'],
    ]
)

# ── 3. PÉRIMÈTRE FONCTIONNEL ──────────────────────────────────
h('3. Périmètre Fonctionnel')

h('3.1 Authentification', 2)
tbl(
    ['ID', 'Fonctionnalité', 'Acteur', 'Description'],
    [
        ['F01', 'Connexion Employé', 'Admin / Agent', "loginEmploye(email, motDePasse) -> token JWT + profil"],
        ['F02', 'Connexion Client',  'Client',        "loginClient(email, motDePasse) -> token JWT + profil"],
        ['F03', 'Profil Employé',    'Admin / Agent', "meEmploye -> informations de l'employe connecte"],
        ['F04', 'Profil Client',     'Client',        "meClient -> informations + contrats du client connecte"],
    ]
)

h('3.2 Gestion des Employes (Admin uniquement)', 2)
tbl(
    ['ID', 'Fonctionnalité', 'Description'],
    [
        ['F05', 'Creer un employe',    'Cree un compte employe (AGENT) rattache a une agence'],
        ['F06', 'Supprimer un employe','Supprime le compte employe'],
        ['F07', 'Lister les employes', 'Liste tous les employes avec leur agence'],
    ]
)

h('3.3 Gestion des Clients (Employes)', 2)
tbl(
    ['ID', 'Fonctionnalité', 'Acteur', 'Description'],
    [
        ['F08', 'Creer un client',    'Admin / Agent', 'Saisie du dossier client ; mot de passe optionnel pour portail'],
        ['F09', 'Modifier un client', 'Admin / Agent', 'Mise a jour des informations'],
        ['F10', 'Supprimer un client','Admin / Agent', 'Suppression du dossier (cascade sur ses contrats)'],
        ['F11', 'Lister les clients', 'Admin / Agent', 'Liste paginee ; Agent filtre sur son agence automatiquement'],
        ['F12', 'Detail client',      'Admin / Agent', 'Fiche client avec ses contrats'],
    ]
)

h('3.4 Gestion des Contrats / Assurances (Employes)', 2)
tbl(
    ['ID', 'Fonctionnalité', 'Acteur', 'Description'],
    [
        ['F13', 'Creer un contrat',    'Admin / Agent',        'Nouveau contrat lie a un client'],
        ['F14', 'Modifier un contrat', 'Admin / Agent',        'Mise a jour des donnees contractuelles'],
        ['F15', 'Supprimer un contrat','Admin / Agent',        'Suppression du contrat'],
        ['F16', 'Lister les contrats', 'Employe / Client',     'Employe : son agence ; Client : ses contrats uniquement'],
    ]
)

# ── 4. ARCHITECTURE ───────────────────────────────────────────
h('4. Architecture Technique')

h('4.1 Stack technologique (pattern MVC)', 2)
tbl(
    ['Couche MVC', 'Technologie', 'Role'],
    [
        ['View (Vue)',        'React 18 + Vite',          'SPA — interface employe et portail client'],
        ['Controller',       'Apollo Server + Resolvers', 'API GraphQL — logique metier, controle acces JWT'],
        ['Model',            'Prisma ORM + PostgreSQL',   'Persistance, migrations versionnees'],
        ['Conteneurisation', 'Docker + Docker Compose',   'frontend:3000 | backend:4000 | db:5432'],
    ]
)

h("4.2 Schema d'architecture", 2)
code(
"""┌────────────────────────────────────────────────────────────┐
│                      Docker Compose                        │
│                                                            │
│  ┌──────────────┐  GraphQL/HTTP  ┌──────────────────────┐  │
│  │  frontend    │ ─────────────► │      backend         │  │
│  │ React + Vite │  (port 3000)   │  Apollo + Prisma     │  │
│  └──────────────┘                └──────────┬───────────┘  │
│                                             │               │
│                                  ┌──────────▼───────────┐  │
│                                  │     PostgreSQL       │  │
│                                  │     (port 5432)      │  │
│                                  └──────────────────────┘  │
└────────────────────────────────────────────────────────────┘"""
)

h("4.3 Regles d'acces (JWT)", 2)
tbl(
    ['Token type', 'Role', 'Acces autorise'],
    [
        ['employe', 'ADMIN',  'Toutes queries et mutations — toutes agences'],
        ['employe', 'AGENT',  'CRUD limite a son agenceId (filtrage cote serveur)'],
        ['client',  'CLIENT', 'assurances (les siennes uniquement), meClient — lecture seule'],
    ]
)

# ── 5. MODELE DE DONNEES ──────────────────────────────────────
h('5. Modele de Donnees')
tbl(
    ['Entite', 'Champs', 'Notes'],
    [
        ['Agence',    'id, nom, ville',
         'Direction Generale | INTIA-Douala | INTIA-Yaounde'],
        ['Employe',   'id, nom, prenom, email, motDePasse(bcrypt), role(ADMIN/AGENT), agenceId?',
         'ADMIN : agenceId null (global)'],
        ['Client',    'id, nom, prenom, email, motDePasse?(bcrypt), telephone?, adresse?, agenceId, createdAt, updatedAt',
         'motDePasse optionnel — active si portail client souhaite'],
        ['Assurance', 'id, type, prime, dateDebut, dateFin, statut(ACTIF/RESILIE), clientId, createdAt, updatedAt',
         'Cascade suppression avec le client'],
    ]
)

h('Relations', 2)
code(
"""Agence  1 ──── N  Employe
Agence  1 ──── N  Client
Client  1 ──── N  Assurance"""
)

# ── 6. API GRAPHQL ────────────────────────────────────────────
h('6. API GraphQL')

h('Authentification', 2)
tbl(
    ['Operation', 'Entree', 'Retour'],
    [
        ['loginEmploye',   'email, motDePasse', 'AuthEmployePayload { token, employe }'],
        ['loginClient',    'email, motDePasse', 'AuthClientPayload  { token, client  }'],
        ['createEmploye',  'EmployeInput',      'Employe (Admin)'],
        ['deleteEmploye',  'id',                'Employe (Admin)'],
    ]
)

h('Queries', 2)
tbl(
    ['Operation', 'Acces', 'Description'],
    [
        ['meEmploye',          'Employe',        "Profil de l'employe connecte"],
        ['meClient',           'Client',         'Profil + contrats du client connecte'],
        ['employes',           'Admin',          'Tous les employes'],
        ['agences',            'Employe',        'Les 3 agences'],
        ['clients(agenceId?)', 'Employe',        'Agent : son agence filtree auto'],
        ['client(id)',         'Employe',        'Detail client'],
        ['assurances(clientId?)','Employe/Client','Client : ses contrats ; Agent : son agence'],
        ['assurance(id)',      'Employe/Client', 'Detail contrat'],
    ]
)

h('Mutations CRUD', 2)
tbl(
    ['Operation', 'Acces'],
    [
        ['createClient / updateClient / deleteClient',          'Employe'],
        ['createAssurance / updateAssurance / deleteAssurance', 'Employe'],
    ]
)

# ── 7. EXIGENCES NON-FONCTIONNELLES ──────────────────────────
h('7. Exigences Non-Fonctionnelles')
tbl(
    ['Critere', 'Exigence'],
    [
        ['Disponibilite',  '99 % — health-check Docker + restart: always'],
        ['Securite',       'JWT HS256 (8h), bcrypt (saltRounds=10), CORS restreint, secrets en .env'],
        ['Isolation',      "Agent ne voit jamais les donnees d'une autre agence (filtrage serveur)"],
        ['Performance',    'Pagination limit/offset sur toutes les listes'],
        ['Maintenabilite', 'Migrations Prisma versionnees, code sur Git'],
        ['Portabilite',    'Docker Compose — deployable sur tout serveur Linux'],
    ]
)

out = r'C:\Users\ellak\intia-insurance\Doc-INTIA\RSD-INTIA.docx'
doc.save(out)
print(f'RSD v2 genere : {out}')
