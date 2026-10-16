# Erasmo – aplikacja studenta

Student wybiera kierunek UEK i semestr wyjazdu, a aplikacja pokazuje:
- **ranking uczelni partnerskich** według dopasowania przedmiotów do jego planu studiów,
- **Learning Agreement** dla wybranej uczelni: przedmiot UEK ↔ najlepszy przedmiot zagraniczny (dobór 1:1).

Dane (sylabusy i oceny dopasowań) przygotowuje panel admina i worker AI w repozytorium `erasmo-admin`.
Ta aplikacja tylko je czyta – przez publiczne widoki `student_*` w Supabase (migracja 14 w erasmo-admin).

## Uruchomienie lokalne
1. Skopiuj `.env.example` jako `.env` i wpisz adres oraz **publiczny** klucz (anon / publishable) bazy.
2. `npm install`
3. `npm run dev` → http://localhost:5173/

## Publikacja
Netlify (ustawienia w `netlify.toml`): build `npm run build`, katalog `dist`,
zmienne środowiskowe `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`.
