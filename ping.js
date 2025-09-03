import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function main() {
  try {
    // Minimal query: fetch just 1 record from 'transactions' table
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(1)

    if (error) throw error
    console.log('✅ Ping successful:', data)
  } catch (err) {
    console.error('❌ Ping failed:', err.message)
    process.exit(1)
  }
}

main()
