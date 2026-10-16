import { createClient } from '@supabase/supabase-js'

// Adres i klucz PUBLICZNY (anon / publishable) bazy Erasmo – wpisane w pliku .env (nie trafia do repo).
// Klucz service_role NIGDY nie może się tu znaleźć: aplikacja działa w przeglądarce studenta.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configError = !url || !key
  ? 'Brak konfiguracji bazy: uzupełnij VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w pliku .env i uruchom ponownie npm run dev.'
  : ''

export const supabase = configError ? null : createClient(url, key)
