
// Arquivo mantido para compatibilidade com importações existentes,
// mas agora sem a funcionalidade real de conexão com Supabase
// Este é um cliente fictício para evitar erros de importação no restante do código

export const supabase = {
  from: () => ({
    select: () => ({
      order: () => ({
        ilike: () => ({})
      })
    }),
    insert: () => ({}),
    update: () => ({}),
    delete: () => ({})
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  rpc: () => Promise.resolve({ data: null, error: null })
};
