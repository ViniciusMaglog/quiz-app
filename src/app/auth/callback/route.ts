import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // CORREÇÃO 1: O construtor de URL precisa de request.url (string)
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard' // Para gestores, o ideal é cair na dashboard

  if (code) {
    // CORREÇÃO 2: No Next.js 15, cookies() é uma Promise e deve ser aguardada
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // CORREÇÃO 3: Agora o set funciona pois cookieStore foi aguardada (await)
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            // CORREÇÃO 4: O mesmo para o remove
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Retorna o usuário para a página inicial se houver erro ou falta de código
  return NextResponse.redirect(`${origin}`)
}