import type { StepResource } from '../types/checklist';

export const TIME_ESTIMATES: Record<string, Record<number, string>> = {
  France: {
    1: '~30 min',
    2: '~30 min',
    3: '~2–4 weeks',
    4: '~1–2 hours',
    5: '~1–2 hours',
    6: '~30 min',
    7: '~30 min',
  },
  Germany: {
    1: '~2–4 weeks',
    2: '~1–2 hours',
    3: '~30 min',
    4: '~1–2 hours',
    5: '~30 min',
    6: 'Auto-sent',
    7: '~2–3 hours',
  },
};

export const STEP_RESOURCES: Record<string, Record<number, StepResource[]>> = {
  France: {
    1: [
      {
        type: 'links',
        title: 'Official Portals',
        items: [
          {
            label: 'ANEF — Validate your long-stay visa',
            url: 'https://administration-etrangers-en-france.interieur.gouv.fr',
            description: 'Official French immigration administration portal',
          },
          {
            label: 'OFII — Register your integration contract',
            url: 'https://www.ofii.fr',
            description: 'Book your medical visit and sign the Republican Integration Contract',
          },
        ],
      },
    ],
    2: [
      {
        type: 'providers',
        title: 'SIM Card Providers',
        items: [
          { label: 'Free Mobile', url: 'https://mobile.free.fr', note: 'Plans from €2/mo' },
          { label: 'Orange', url: 'https://www.orange.fr/portail', note: 'Best nationwide coverage' },
          { label: 'Lebara', url: 'https://mobile.lebara.com/fr/fr', note: 'Great for international calls' },
          { label: 'Syma Mobile', url: 'https://www.symamobile.com', note: 'No-commitment, budget plans' },
          { label: 'Lycamobile', url: 'https://www.lycamobile.fr', note: 'Popular with expats' },
        ],
      },
    ],
    3: [
      {
        type: 'links',
        title: 'Accommodation Platforms',
        items: [
          { label: 'PAP.fr — De Particulier à Particulier', url: 'https://www.pap.fr', description: 'Rent directly from landlords — no agency fees' },
          { label: 'Studapart', url: 'https://studapart.com', description: 'Student & young professional housing' },
          { label: 'Leboncoin — Locations', url: 'https://www.leboncoin.fr/recherche?category=10', description: 'Largest classifieds site in France' },
          { label: 'Appartager — Flatsharing', url: 'https://www.appartager.com', description: 'Colocation & flatshare listings' },
          { label: 'SeLoger', url: 'https://www.seloger.com', description: 'Large rental marketplace with verified listings' },
        ],
      },
    ],
    4: [
      {
        type: 'links',
        title: 'Registration Portals',
        items: [
          { label: 'Ameli.fr — Get your Social Security number', url: 'https://www.ameli.fr', description: 'Apply for your numéro de sécu through the CPAM' },
          { label: 'Service-public.fr — Administrative guide', url: 'https://www.service-public.fr', description: 'Official portal for all administrative procedures in France' },
        ],
      },
    ],
    5: [
      {
        type: 'banks',
        traditional: [
          { label: 'BNP Paribas', url: 'https://mabanque.bnpparibas/', domain: 'bnpparibas.fr' },
          { label: 'Société Générale', url: 'https://particuliers.sg.fr/', domain: 'sg.fr' },
          { label: 'Crédit Agricole', url: 'https://www.credit-agricole.fr/', domain: 'credit-agricole.fr' },
        ],
        digital: [
          { label: 'Revolut', url: 'https://www.revolut.com/', domain: 'revolut.com' },
          { label: 'N26', url: 'https://n26.com/fr-fr', domain: 'n26.com' },
          { label: 'Wise', url: 'https://wise.com/', domain: 'wise.com' },
        ],
      },
    ],
    6: [
      {
        type: 'links',
        title: 'Healthcare Registration',
        items: [
          { label: 'Ameli.fr — Register with Assurance Maladie', url: 'https://www.ameli.fr', description: 'Activate your health coverage and request your Carte Vitale' },
        ],
      },
    ],
    7: [
      {
        type: 'notice',
        variant: 'warning',
        title: 'Deadline for Non-European Students',
        message: 'July 2026 is the last month to receive CAF housing benefit for non-European students. Apply as soon as possible to avoid missing out on this benefit.',
      },
      {
        type: 'links',
        title: 'Housing Benefit',
        items: [
          { label: 'CAF.fr — Apply for APL / ALS housing benefit', url: 'https://www.caf.fr', description: 'Can reduce rent by €100–300/month depending on income & location' },
          { label: 'CAF Eligibility Simulator', url: 'https://wwwd.caf.fr/wps/portal/caffr/simulateuraide', description: 'Check how much benefit you may be entitled to' },
        ],
      },
    ],
  },
  Germany: {
    1: [
      {
        type: 'links',
        title: 'Accommodation Platforms',
        items: [
          { label: 'Immobilienscout24', url: 'https://www.immobilienscout24.de', description: 'Largest property portal in Germany' },
          { label: 'WG-Gesucht — Flatsharing', url: 'https://www.wg-gesucht.de', description: 'Most popular flatshare & room listings' },
          { label: 'Immowelt', url: 'https://www.immowelt.de', description: 'Wide selection of rentals across Germany' },
          { label: 'Wohnungsboerse.net', url: 'https://www.wohnungsboerse.net', description: 'Rental listings across Germany' },
          { label: 'Studenten-WG', url: 'https://www.studenten-wg.de', description: 'Student-focused shared housing' },
        ],
      },
    ],
    2: [
      {
        type: 'links',
        title: 'Anmeldung — Address Registration',
        items: [
          {
            label: 'Berlin Bürgeramt — Book an appointment',
            url: 'https://service.berlin.de/dienstleistung/120686/',
            description: 'Register your address at a local Bürgeramt (required within 14 days of moving in)',
          },
          {
            label: 'Bundesregierung — Anmeldung guide',
            url: 'https://www.bundesregierung.de/breg-de/themen/umzug-anmeldung',
            description: 'Official federal guide for registering your address in Germany',
          },
        ],
      },
    ],
    3: [
      {
        type: 'providers',
        title: 'SIM Card Providers',
        items: [
          { label: 'Deutsche Telekom', url: 'https://www.telekom.de', note: 'Best nationwide coverage' },
          { label: 'Vodafone', url: 'https://www.vodafone.de', note: 'Strong 4G/5G network' },
          { label: 'O2 / Telefónica', url: 'https://www.o2online.de', note: 'Competitive plans' },
          { label: 'Lebara', url: 'https://mobile.lebara.com/de/de', note: 'Great for international calls' },
          { label: 'Aldi Talk', url: 'https://www.alditalk.de', note: 'Budget prepaid on Telekom network' },
        ],
      },
    ],
    4: [
      {
        type: 'banks',
        traditional: [
          { label: 'Deutsche Bank', url: 'https://www.deutsche-bank.de', domain: 'deutsche-bank.de' },
          { label: 'Commerzbank', url: 'https://www.commerzbank.de', domain: 'commerzbank.de' },
          { label: 'Sparkasse', url: 'https://www.sparkasse.de', domain: 'sparkasse.de' },
        ],
        digital: [
          { label: 'N26', url: 'https://n26.com/de-de', domain: 'n26.com' },
          { label: 'DKB', url: 'https://www.dkb.de', domain: 'dkb.de' },
          { label: 'Revolut', url: 'https://www.revolut.com/', domain: 'revolut.com' },
          { label: 'Wise', url: 'https://wise.com/', domain: 'wise.com' },
        ],
      },
    ],
    5: [
      {
        type: 'providers',
        title: 'Public Health Insurance (Krankenkasse)',
        items: [
          { label: 'Techniker Krankenkasse (TK)', url: 'https://www.tk.de', note: 'Most popular — English-friendly' },
          { label: 'AOK', url: 'https://www.aok.de', note: 'Largest public insurer' },
          { label: 'Barmer', url: 'https://www.barmer.de', note: 'Nationwide coverage' },
          { label: 'DAK-Gesundheit', url: 'https://www.dak.de', note: 'Good expat support' },
        ],
      },
    ],
    6: [
      {
        type: 'links',
        title: 'Tax ID & Filing',
        items: [
          {
            label: 'ELSTER — Online tax portal',
            url: 'https://www.elster.de',
            description: 'Register for online tax filing and get your Steuernummer from your local Finanzamt',
          },
          {
            label: 'BZSt — Request your Steueridentifikationsnummer',
            url: 'https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html',
            description: 'Reissue request if your Steuer-ID was not received by post after Anmeldung',
          },
        ],
      },
    ],
    7: [
      {
        type: 'notice',
        variant: 'warning',
        title: 'Non-EU Nationals Only',
        message: 'Non-EU citizens must apply for a residence permit (Aufenthaltstitel) at the local Ausländerbehörde within 90 days of arrival. Bring your passport, Meldebescheinigung, health insurance certificate, and proof of financial means.',
      },
      {
        type: 'links',
        title: 'Residence Permit Portals',
        items: [
          {
            label: 'Berlin Ausländerbehörde — Book an appointment',
            url: 'https://service.berlin.de/dienstleistung/324659/',
            description: 'Apply for a residence or work permit (Aufenthaltstitel) in Berlin',
          },
          {
            label: 'Make it in Germany — Residence permit guide',
            url: 'https://www.make-it-in-germany.com/en/visa-residence/living-in-germany/residence-permit/',
            description: 'Official guide for skilled workers and immigrants to Germany',
          },
        ],
      },
    ],
  },
};
