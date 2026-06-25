---
layout: page
title: "Datenschutz"
subtitle: Wie mit Ihren Daten umgegangen wird
description: "Wie die Federwerkstatt mit Ihren Daten umgeht: keine Konten, keine Analyse-Tools, kein Tracking, keine eigenen Cookies — nur das Nötigste für Hosting und einwilligungspflichtige CDNs."
permalink: /privacy/
---

**Zuletzt aktualisiert: {{ 'now' | date: '%B %Y' }}**

## Überblick

Die Federwerkstatt achtet Ihre Privatsphäre. Es handelt sich um eine statische
Website ohne Benutzerkonten, ohne Analyse-Tools und ohne eigene (First-Party-)Cookies.
Im Folgenden ist genau aufgeführt, welche (wenigen) Daten überhaupt anfallen und warum.

## Statisches Hosting (GitHub Pages)

Diese Seite wird über **GitHub Pages** bereitgestellt. GitHub kann im Rahmen des
Hostings grundlegende Server-Protokolle erheben (IP-Adressen, Browserangaben).
**Rechtsgrundlage:** berechtigtes Interesse (technische Bereitstellung der Seite).
Weitere Informationen: [Datenschutzerklärung von GitHub](https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement).

## Suche & Diagramme (Lunr.js & Chart.js über CDN)

Die Volltextsuche der Seite lädt **Lunr.js** vom unpkg-CDN, und Artikel mit
Diagrammen laden **Chart.js** vom jsDelivr-CDN. Beide Bibliotheken laufen vollständig
in Ihrem Browser; das Laden über ein CDN gibt Ihre IP-Adresse und Browserangaben an
das jeweilige CDN weiter. Beide werden erst geladen, nachdem Sie eine funktionale
Einwilligung erteilt haben.
**Rechtsgrundlage:** Einwilligung.

## PDF-Reader

Der themengetreue Reader für die Werke (PDF) ist **selbst gehostet**: Die zugrunde
liegende Bibliothek (PDF.js) wird von dieser Seite ausgeliefert, nicht von einem
Drittanbieter. Es werden dabei keine Daten an externe Dienste übermittelt, und es ist
keine Einwilligung erforderlich.

## Vorlesefunktion

Die Vorlesefunktion nutzt die im Browser eingebaute **Web Speech API**. Es werden
keine Daten an externe Dienste gesendet — alles geschieht lokal auf Ihrem Gerät.

## Analyse-Tools

Diese Seite verwendet **kein** Google Analytics und keinen anderen
Tracking- oder Analysedienst. Es werden keine Tracking-Cookies gesetzt.

## Cookie-Einwilligungsbanner

Diese Seite zeigt ein **Cookie-Einwilligungsbanner**. Skripte von Drittanbietern sind
**standardmäßig blockiert** und werden erst nach Ihrer ausdrücklichen Einwilligung
geladen. Sie können Ihre Wahl jederzeit über den Link „Cookie-Einstellungen“ im
Footer ändern. Die Einwilligung wird im `localStorage` unter dem Schlüssel
`cookie_consent` für 365 Tage gespeichert.

- **Essenziell** (immer aktiv): `localStorage` für Theme-Auswahl, Ansichtsmodus und
  Ihre Einwilligungsentscheidung.
- **Funktionale Dienste** (Opt-in): Lunr.js/unpkg (Suche) und Chart.js/jsDelivr
  (Diagramme in Artikeln).

## Cookies & lokaler Speicher

Diese Seite setzt keine eigenen Cookies. Sie nutzt ausschließlich `localStorage`, der
auf Ihrem Gerät verbleibt und niemals übertragen wird. Die eigenen
`localStorage`-Schlüssel der Seite sind:

- `theme` — Auswahl zwischen hellem und dunklem Erscheinungsbild
- `viewMode` — Ansichtsmodus für Bilder in Artikeln (z. B. Karussell)
- `headerSticky` — ob die Kopfzeile angeheftet bleibt
- `cookie_consent` — Ihre Einwilligungsentscheidung (für 365 Tage gespeichert)

## Übersicht der Drittanbieterdienste

| Dienst | Zweck | Erhobene Daten | Setzt Cookies? |
|---|---|---|:---:|
| **GitHub Pages** | Hosting | Server-Protokolle | Nein |
| **unpkg-CDN** | Auslieferung der Suchbibliothek (Lunr.js) | IP-Adresse, Browserangaben | Nein |
| **jsDelivr-CDN** | Auslieferung der Diagrammbibliothek (Chart.js) | IP-Adresse, Browserangaben | Nein |

## Ihre Rechte (Betroffenenrechte)

Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch,
Datenübertragbarkeit sowie auf jederzeitigen Widerruf Ihrer Einwilligung (über die
„Cookie-Einstellungen“ im Footer). Da auf der Infrastruktur dieser Seite keine
personenbezogenen Daten dauerhaft gespeichert werden, gibt es nur wenig, worauf sich
diese Rechte beziehen könnten.

## Änderungen dieser Datenschutzerklärung

Diese Erklärung kann bei Bedarf aktualisiert werden. Die jeweils aktuelle Fassung ist
stets auf dieser Seite abrufbar. Änderungen werden durch ein neues Datum unter
„Zuletzt aktualisiert“ kenntlich gemacht.

*Zuletzt aktualisiert: {{ 'now' | date: '%B %Y' }}*
