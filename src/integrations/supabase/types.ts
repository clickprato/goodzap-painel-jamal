export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      area_entrega: {
        Row: {
          area_entrega: boolean | null
          cep: string | null
          created_at: string
          distancia: number | null
          distancia_maxima: number | null
          id: number
          session: string | null
          tempo_medio_entrega: string | null
          valor: number | null
          valor_frete: number | null
        }
        Insert: {
          area_entrega?: boolean | null
          cep?: string | null
          created_at?: string
          distancia?: number | null
          distancia_maxima?: number | null
          id?: number
          session?: string | null
          tempo_medio_entrega?: string | null
          valor?: number | null
          valor_frete?: number | null
        }
        Update: {
          area_entrega?: boolean | null
          cep?: string | null
          created_at?: string
          distancia?: number | null
          distancia_maxima?: number | null
          id?: number
          session?: string | null
          tempo_medio_entrega?: string | null
          valor?: number | null
          valor_frete?: number | null
        }
        Relationships: []
      }
      bebidas: {
        Row: {
          created_at: string
          disponivel: boolean
          id: number
          nome: string | null
          tamanho: string | null
          tipo: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          disponivel?: boolean
          id?: number
          nome?: string | null
          tamanho?: string | null
          tipo?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          disponivel?: boolean
          id?: number
          nome?: string | null
          tamanho?: string | null
          tipo?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      borda_recheada: {
        Row: {
          created_at: string
          id: number
          tamanho_pizza: string | null
          valor_borda_recheada: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          tamanho_pizza?: string | null
          valor_borda_recheada?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          tamanho_pizza?: string | null
          valor_borda_recheada?: number | null
        }
        Relationships: []
      }
      cardapio: {
        Row: {
          additional_categories: string[] | null
          available: boolean | null
          borders_position: number | null
          category: string
          combination: Json | null
          cost: number | null
          created_at: string
          description: string
          display_order: number
          frete_gratis: boolean | null
          has_variations: boolean | null
          height_cm: number | null
          hidden_in_menu: boolean
          id: string
          image: string
          is_half_pizza: boolean | null
          length_cm: number | null
          max_sabores: number | null
          name: string
          permite_combinacao: boolean | null
          pizza_borders: Json | null
          pizza_sizes: Json
          popular: boolean | null
          price: number
          price_from: boolean | null
          sku: string | null
          stock: number | null
          submenu_description: string | null
          submenu_item_ids: string[]
          submenu_name: string | null
          tipo: string | null
          updated_at: string
          variation_groups: Json | null
          weight_g: number | null
          width_cm: number | null
        }
        Insert: {
          additional_categories?: string[] | null
          available?: boolean | null
          borders_position?: number | null
          category: string
          combination?: Json | null
          cost?: number | null
          created_at?: string
          description?: string
          display_order?: number
          frete_gratis?: boolean | null
          has_variations?: boolean | null
          height_cm?: number | null
          hidden_in_menu?: boolean
          id: string
          image?: string
          is_half_pizza?: boolean | null
          length_cm?: number | null
          max_sabores?: number | null
          name: string
          permite_combinacao?: boolean | null
          pizza_borders?: Json | null
          pizza_sizes?: Json
          popular?: boolean | null
          price?: number
          price_from?: boolean | null
          sku?: string | null
          stock?: number | null
          submenu_description?: string | null
          submenu_item_ids?: string[]
          submenu_name?: string | null
          tipo?: string | null
          updated_at?: string
          variation_groups?: Json | null
          weight_g?: number | null
          width_cm?: number | null
        }
        Update: {
          additional_categories?: string[] | null
          available?: boolean | null
          borders_position?: number | null
          category?: string
          combination?: Json | null
          cost?: number | null
          created_at?: string
          description?: string
          display_order?: number
          frete_gratis?: boolean | null
          has_variations?: boolean | null
          height_cm?: number | null
          hidden_in_menu?: boolean
          id?: string
          image?: string
          is_half_pizza?: boolean | null
          length_cm?: number | null
          max_sabores?: number | null
          name?: string
          permite_combinacao?: boolean | null
          pizza_borders?: Json | null
          pizza_sizes?: Json
          popular?: boolean | null
          price?: number
          price_from?: boolean | null
          sku?: string | null
          stock?: number | null
          submenu_description?: string | null
          submenu_item_ids?: string[]
          submenu_name?: string | null
          tipo?: string | null
          updated_at?: string
          variation_groups?: Json | null
          weight_g?: number | null
          width_cm?: number | null
        }
        Relationships: []
      }
      cardapio2: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string | null
          disponivel: boolean
          id: number
          id_original: string | null
          nome_do_prato: string | null
          preco: number | null
          url_image: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: number
          id_original?: string | null
          nome_do_prato?: string | null
          preco?: number | null
          url_image?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: number
          id_original?: string | null
          nome_do_prato?: string | null
          preco?: number | null
          url_image?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          aniversario: string | null
          area_entrega: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          codigo: string | null
          complemento: string | null
          compras: number | null
          created_at: string
          distancia: number | null
          distancia_maxima: number | null
          estado: string | null
          id: number
          nome: string | null
          numero: string | null
          rua: string | null
          status: string | null
          total_gasto: number | null
          ultima_atualizacao: string | null
          ultima_compra: string | null
          ultimo_pedido: string | null
          valor_frete: number | null
          whatsapp: string | null
        }
        Insert: {
          aniversario?: string | null
          area_entrega?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string | null
          complemento?: string | null
          compras?: number | null
          created_at?: string
          distancia?: number | null
          distancia_maxima?: number | null
          estado?: string | null
          id?: number
          nome?: string | null
          numero?: string | null
          rua?: string | null
          status?: string | null
          total_gasto?: number | null
          ultima_atualizacao?: string | null
          ultima_compra?: string | null
          ultimo_pedido?: string | null
          valor_frete?: number | null
          whatsapp?: string | null
        }
        Update: {
          aniversario?: string | null
          area_entrega?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string | null
          complemento?: string | null
          compras?: number | null
          created_at?: string
          distancia?: number | null
          distancia_maxima?: number | null
          estado?: string | null
          id?: number
          nome?: string | null
          numero?: string | null
          rua?: string | null
          status?: string | null
          total_gasto?: number | null
          ultima_atualizacao?: string | null
          ultima_compra?: string | null
          ultimo_pedido?: string | null
          valor_frete?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      clientes_clickflow: {
        Row: {
          aniversario: string | null
          aniversario_timestamp: string | null
          created_at: string
          data_cadastro: string | null
          data_envio_rec: string | null
          id: number
          ja_enviado: string | null
          mensagem_enviada_clickflow: string | null
          msg1_aniversario_data_envio: string | null
          msg1_aniversario_enviada: string | null
          msg2_aniversario_data_envio: string | null
          msg2_aniversario_enviada: string | null
          msg3_aniversario_data_envio: string | null
          msg3_aniversario_enviada: string | null
          nome: string | null
          observacoes: string | null
          opt_out: boolean | null
          pedidos: string | null
          promocao_enviada_clickflow: string | null
          session: string | null
          taxa: string | null
          ultimo_envio: string | null
          ultimo_pedido: string | null
          ultimo_pedido_timestamp: string | null
          whatsapp: string | null
        }
        Insert: {
          aniversario?: string | null
          aniversario_timestamp?: string | null
          created_at?: string
          data_cadastro?: string | null
          data_envio_rec?: string | null
          id?: number
          ja_enviado?: string | null
          mensagem_enviada_clickflow?: string | null
          msg1_aniversario_data_envio?: string | null
          msg1_aniversario_enviada?: string | null
          msg2_aniversario_data_envio?: string | null
          msg2_aniversario_enviada?: string | null
          msg3_aniversario_data_envio?: string | null
          msg3_aniversario_enviada?: string | null
          nome?: string | null
          observacoes?: string | null
          opt_out?: boolean | null
          pedidos?: string | null
          promocao_enviada_clickflow?: string | null
          session?: string | null
          taxa?: string | null
          ultimo_envio?: string | null
          ultimo_pedido?: string | null
          ultimo_pedido_timestamp?: string | null
          whatsapp?: string | null
        }
        Update: {
          aniversario?: string | null
          aniversario_timestamp?: string | null
          created_at?: string
          data_cadastro?: string | null
          data_envio_rec?: string | null
          id?: number
          ja_enviado?: string | null
          mensagem_enviada_clickflow?: string | null
          msg1_aniversario_data_envio?: string | null
          msg1_aniversario_enviada?: string | null
          msg2_aniversario_data_envio?: string | null
          msg2_aniversario_enviada?: string | null
          msg3_aniversario_data_envio?: string | null
          msg3_aniversario_enviada?: string | null
          nome?: string | null
          observacoes?: string | null
          opt_out?: boolean | null
          pedidos?: string | null
          promocao_enviada_clickflow?: string | null
          session?: string | null
          taxa?: string | null
          ultimo_envio?: string | null
          ultimo_pedido?: string | null
          ultimo_pedido_timestamp?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      configuracoes_goodzap: {
        Row: {
          created_at: string
          distancia_maxima: number | null
          goodzap_status: string | null
          id: number
          model: string | null
          session: string | null
          tempo_atraso_minutos: number | null
          tempo_entrega_minutos: number | null
          tempo_resposta_minutos: number
        }
        Insert: {
          created_at?: string
          distancia_maxima?: number | null
          goodzap_status?: string | null
          id?: number
          model?: string | null
          session?: string | null
          tempo_atraso_minutos?: number | null
          tempo_entrega_minutos?: number | null
          tempo_resposta_minutos?: number
        }
        Update: {
          created_at?: string
          distancia_maxima?: number | null
          goodzap_status?: string | null
          id?: number
          model?: string | null
          session?: string | null
          tempo_atraso_minutos?: number | null
          tempo_entrega_minutos?: number | null
          tempo_resposta_minutos?: number
        }
        Relationships: []
      }
      empresa_info: {
        Row: {
          bairro_empresa: string | null
          cep_empresa: string | null
          cidade_empresa: string | null
          created_at: string
          id: number
          nome_empresa: string | null
          numero_empresa: string | null
          rua_empresa: string | null
          telefone_empresa: string | null
          token: string | null
          whatsapp_empresa: string | null
        }
        Insert: {
          bairro_empresa?: string | null
          cep_empresa?: string | null
          cidade_empresa?: string | null
          created_at?: string
          id?: number
          nome_empresa?: string | null
          numero_empresa?: string | null
          rua_empresa?: string | null
          telefone_empresa?: string | null
          token?: string | null
          whatsapp_empresa?: string | null
        }
        Update: {
          bairro_empresa?: string | null
          cep_empresa?: string | null
          cidade_empresa?: string | null
          created_at?: string
          id?: number
          nome_empresa?: string | null
          numero_empresa?: string | null
          rua_empresa?: string | null
          telefone_empresa?: string | null
          token?: string | null
          whatsapp_empresa?: string | null
        }
        Relationships: []
      }
      faixas_frete: {
        Row: {
          created_at: string | null
          id: string
          km_final: number
          km_inicial: number
          valor: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          km_final: number
          km_inicial: number
          valor: number
        }
        Update: {
          created_at?: string | null
          id?: string
          km_final?: number
          km_inicial?: number
          valor?: number
        }
        Relationships: []
      }
      horario_empresa_goodzap: {
        Row: {
          abre_as: string
          ativo: boolean
          created_at: string
          dia_semana_id: number
          dia_semana_nome: string
          fecha_as: string
        }
        Insert: {
          abre_as?: string
          ativo?: boolean
          created_at?: string
          dia_semana_id: number
          dia_semana_nome: string
          fecha_as?: string
        }
        Update: {
          abre_as?: string
          ativo?: boolean
          created_at?: string
          dia_semana_id?: number
          dia_semana_nome?: string
          fecha_as?: string
        }
        Relationships: []
      }
      horarios_goodzap: {
        Row: {
          ativa: boolean | null
          created_at: string
          detalhes: string | null
          horario: string
          id: number
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          detalhes?: string | null
          horario: string
          id?: number
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          detalhes?: string | null
          horario?: string
          id?: number
        }
        Relationships: []
      }
      keep_alive: {
        Row: {
          check: string | null
          created_at: string
          id: number
        }
        Insert: {
          check?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          check?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      numeros_especiais: {
        Row: {
          created_at: string
          id: number
          nome: string
          telefone: string
        }
        Insert: {
          created_at?: string
          id?: number
          nome: string
          telefone: string
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      outros_produtos: {
        Row: {
          created_at: string
          descricao: string | null
          disponivel: boolean | null
          id: number
          produto: string | null
          tipo: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          disponivel?: boolean | null
          id?: number
          produto?: string | null
          tipo?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          disponivel?: boolean | null
          id?: number
          produto?: string | null
          tipo?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      pedidos_goodzap: {
        Row: {
          cep: string | null
          codigo_pedido: string
          created_at: string
          criado_em: string | null
          empresa: string | null
          endereco: string
          id: number
          nome: string
          observacoes: string | null
          pagamento: string | null
          pedido: string
          sessao: string
          total: string
          ultimo_envio: string | null
          ultimo_pedido: string | null
          whatsapp: string
        }
        Insert: {
          cep?: string | null
          codigo_pedido: string
          created_at: string
          criado_em?: string | null
          empresa?: string | null
          endereco: string
          id?: number
          nome: string
          observacoes?: string | null
          pagamento?: string | null
          pedido: string
          sessao: string
          total: string
          ultimo_envio?: string | null
          ultimo_pedido?: string | null
          whatsapp: string
        }
        Update: {
          cep?: string | null
          codigo_pedido?: string
          created_at?: string
          criado_em?: string | null
          empresa?: string | null
          endereco?: string
          id?: number
          nome?: string
          observacoes?: string | null
          pagamento?: string | null
          pedido?: string
          sessao?: string
          total?: string
          ultimo_envio?: string | null
          ultimo_pedido?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      promocao_aniversario: {
        Row: {
          agendamento_ativo: boolean
          agendamento_data_final: string | null
          agendamento_data_inicio: string | null
          agendamento_dias_semana: number[] | null
          agendamento_horarios: string[] | null
          agendamento_timezone: string
          agendamento_tipo: string | null
          created_at: string
          enviado: string | null
          id: number
          imagem_1_ativa: boolean
          imagem_1_url: string | null
          imagem_2_ativa: boolean
          imagem_2_url: string | null
          imagem_3_ativa: boolean
          imagem_3_url: string | null
          legenda_1: string | null
          legenda_2: string | null
          legenda_3: string | null
          mensagem_1: string | null
          mensagem_2: string | null
          mensagem_3: string | null
          next_run_at: string | null
          quant_msg: number | null
          status: string | null
          ultimo_disparo_at: string | null
        }
        Insert: {
          agendamento_ativo?: boolean
          agendamento_data_final?: string | null
          agendamento_data_inicio?: string | null
          agendamento_dias_semana?: number[] | null
          agendamento_horarios?: string[] | null
          agendamento_timezone?: string
          agendamento_tipo?: string | null
          created_at?: string
          enviado?: string | null
          id?: number
          imagem_1_ativa?: boolean
          imagem_1_url?: string | null
          imagem_2_ativa?: boolean
          imagem_2_url?: string | null
          imagem_3_ativa?: boolean
          imagem_3_url?: string | null
          legenda_1?: string | null
          legenda_2?: string | null
          legenda_3?: string | null
          mensagem_1?: string | null
          mensagem_2?: string | null
          mensagem_3?: string | null
          next_run_at?: string | null
          quant_msg?: number | null
          status?: string | null
          ultimo_disparo_at?: string | null
        }
        Update: {
          agendamento_ativo?: boolean
          agendamento_data_final?: string | null
          agendamento_data_inicio?: string | null
          agendamento_dias_semana?: number[] | null
          agendamento_horarios?: string[] | null
          agendamento_timezone?: string
          agendamento_tipo?: string | null
          created_at?: string
          enviado?: string | null
          id?: number
          imagem_1_ativa?: boolean
          imagem_1_url?: string | null
          imagem_2_ativa?: boolean
          imagem_2_url?: string | null
          imagem_3_ativa?: boolean
          imagem_3_url?: string | null
          legenda_1?: string | null
          legenda_2?: string | null
          legenda_3?: string | null
          mensagem_1?: string | null
          mensagem_2?: string | null
          mensagem_3?: string | null
          next_run_at?: string | null
          quant_msg?: number | null
          status?: string | null
          ultimo_disparo_at?: string | null
        }
        Relationships: []
      }
      promocoes_goodzap: {
        Row: {
          agendamento_ativo: boolean
          agendamento_data_final: string | null
          agendamento_data_inicio: string | null
          agendamento_dias_semana: number[] | null
          agendamento_horarios: string[] | null
          agendamento_timezone: string
          agendamento_tipo: string | null
          ativa: boolean | null
          created_at: string
          id: number
          imagem_ativa: boolean
          imagem_promocao: string | null
          imagem_url: string | null
          legenda: string | null
          next_run_at: string | null
          promocao: string
          regras: string | null
          ultimo_disparo_at: string | null
        }
        Insert: {
          agendamento_ativo?: boolean
          agendamento_data_final?: string | null
          agendamento_data_inicio?: string | null
          agendamento_dias_semana?: number[] | null
          agendamento_horarios?: string[] | null
          agendamento_timezone?: string
          agendamento_tipo?: string | null
          ativa?: boolean | null
          created_at?: string
          id?: number
          imagem_ativa?: boolean
          imagem_promocao?: string | null
          imagem_url?: string | null
          legenda?: string | null
          next_run_at?: string | null
          promocao: string
          regras?: string | null
          ultimo_disparo_at?: string | null
        }
        Update: {
          agendamento_ativo?: boolean
          agendamento_data_final?: string | null
          agendamento_data_inicio?: string | null
          agendamento_dias_semana?: number[] | null
          agendamento_horarios?: string[] | null
          agendamento_timezone?: string
          agendamento_tipo?: string | null
          ativa?: boolean | null
          created_at?: string
          id?: number
          imagem_ativa?: boolean
          imagem_promocao?: string | null
          imagem_url?: string | null
          legenda?: string | null
          next_run_at?: string | null
          promocao?: string
          regras?: string | null
          ultimo_disparo_at?: string | null
        }
        Relationships: []
      }
      recuperacao_clientes: {
        Row: {
          agendamento_ativo: boolean
          agendamento_data_final: string | null
          agendamento_data_inicio: string | null
          agendamento_dias_semana: number[] | null
          agendamento_horarios: string[] | null
          agendamento_timezone: string
          agendamento_tipo: string | null
          ativa_promocao: string | null
          created_at: string
          data_final: string | null
          data_inicio: string | null
          id: number
          imagem_1_ativa: boolean
          imagem_1_url: string | null
          imagem_2_ativa: boolean
          imagem_2_url: string | null
          imagem_3_ativa: boolean
          imagem_3_url: string | null
          imagem_ativa: boolean
          imagem_url: string | null
          legenda: string | null
          legenda_1: string | null
          legenda_2: string | null
          legenda_3: string | null
          legenda_ativa: boolean
          mensagem: string | null
          mensagem_2: string | null
          mensagem_3: string | null
          mensagem_ativa: boolean
          mensagens: Json
          next_run_at: string | null
          promocao: string | null
          prox_msg: number | null
          quant_msg: number
          regras: string | null
          status: string | null
          ultimo_disparo_at: string | null
        }
        Insert: {
          agendamento_ativo?: boolean
          agendamento_data_final?: string | null
          agendamento_data_inicio?: string | null
          agendamento_dias_semana?: number[] | null
          agendamento_horarios?: string[] | null
          agendamento_timezone?: string
          agendamento_tipo?: string | null
          ativa_promocao?: string | null
          created_at?: string
          data_final?: string | null
          data_inicio?: string | null
          id?: number
          imagem_1_ativa?: boolean
          imagem_1_url?: string | null
          imagem_2_ativa?: boolean
          imagem_2_url?: string | null
          imagem_3_ativa?: boolean
          imagem_3_url?: string | null
          imagem_ativa?: boolean
          imagem_url?: string | null
          legenda?: string | null
          legenda_1?: string | null
          legenda_2?: string | null
          legenda_3?: string | null
          legenda_ativa?: boolean
          mensagem?: string | null
          mensagem_2?: string | null
          mensagem_3?: string | null
          mensagem_ativa?: boolean
          mensagens?: Json
          next_run_at?: string | null
          promocao?: string | null
          prox_msg?: number | null
          quant_msg?: number
          regras?: string | null
          status?: string | null
          ultimo_disparo_at?: string | null
        }
        Update: {
          agendamento_ativo?: boolean
          agendamento_data_final?: string | null
          agendamento_data_inicio?: string | null
          agendamento_dias_semana?: number[] | null
          agendamento_horarios?: string[] | null
          agendamento_timezone?: string
          agendamento_tipo?: string | null
          ativa_promocao?: string | null
          created_at?: string
          data_final?: string | null
          data_inicio?: string | null
          id?: number
          imagem_1_ativa?: boolean
          imagem_1_url?: string | null
          imagem_2_ativa?: boolean
          imagem_2_url?: string | null
          imagem_3_ativa?: boolean
          imagem_3_url?: string | null
          imagem_ativa?: boolean
          imagem_url?: string | null
          legenda?: string | null
          legenda_1?: string | null
          legenda_2?: string | null
          legenda_3?: string | null
          legenda_ativa?: boolean
          mensagem?: string | null
          mensagem_2?: string | null
          mensagem_3?: string | null
          mensagem_ativa?: boolean
          mensagens?: Json
          next_run_at?: string | null
          promocao?: string | null
          prox_msg?: number | null
          quant_msg?: number
          regras?: string | null
          status?: string | null
          ultimo_disparo_at?: string | null
        }
        Relationships: []
      }
      reservas: {
        Row: {
          created_at: string
          data_reserva: string | null
          horario_reserva: string | null
          id: number
          nome: string | null
          observacoes: string | null
          qtde_pessoas: number | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          data_reserva?: string | null
          horario_reserva?: string | null
          id?: number
          nome?: string | null
          observacoes?: string | null
          qtde_pessoas?: number | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          data_reserva?: string | null
          horario_reserva?: string | null
          id?: number
          nome?: string | null
          observacoes?: string | null
          qtde_pessoas?: number | null
          whatsapp?: string
        }
        Relationships: []
      }
      saudacoes_goodzap: {
        Row: {
          ativa: boolean | null
          created_at: string
          id: number
          saudacao: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          id?: number
          saudacao: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          id?: number
          saudacao?: string
        }
        Relationships: []
      }
      telefones_admin_goodzap: {
        Row: {
          ativa: boolean | null
          created_at: string
          id: number
          numero_atendente: string | null
          numero_gerente: string | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          id?: number
          numero_atendente?: string | null
          numero_gerente?: string | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          id?: number
          numero_atendente?: string | null
          numero_gerente?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          created_at: string | null
          id: string
          token: string
          token_role: Database["public"]["Enums"]["app_role"]
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          token: string
          token_role?: Database["public"]["Enums"]["app_role"]
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          token?: string
          token_role?: Database["public"]["Enums"]["app_role"]
          used?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhooks_campanhas: {
        Row: {
          comunicacao_apikey: string | null
          comunicacao_instancia: string | null
          id: number
          updated_at: string
          webhook_aniversariantes: string | null
          webhook_promocoes: string | null
          webhook_recuperacao: string | null
          webhook_reservas: string | null
        }
        Insert: {
          comunicacao_apikey?: string | null
          comunicacao_instancia?: string | null
          id?: number
          updated_at?: string
          webhook_aniversariantes?: string | null
          webhook_promocoes?: string | null
          webhook_recuperacao?: string | null
          webhook_reservas?: string | null
        }
        Update: {
          comunicacao_apikey?: string | null
          comunicacao_instancia?: string | null
          id?: number
          updated_at?: string
          webhook_aniversariantes?: string | null
          webhook_promocoes?: string | null
          webhook_recuperacao?: string | null
          webhook_reservas?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role_from_token: {
        Args: { _token: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      atualizar_metricas_clientes: { Args: never; Returns: undefined }
      buscar_disparos_prontos: {
        Args: { p_limite?: number }
        Returns: {
          dados: Json
          id: number
          next_run_at: string
          origem: string
        }[]
      }
      calcular_next_run_at: {
        Args: {
          p_ativo: boolean
          p_data_final: string
          p_data_inicio: string
          p_dias_semana: number[]
          p_horarios: string[]
          p_timezone: string
          p_tipo: string
        }
        Returns: string
      }
      get_full_config: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super-admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "super-admin"],
    },
  },
} as const
