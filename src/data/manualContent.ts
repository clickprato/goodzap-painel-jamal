interface ManualBlock {
  heading?: string;
  text: string;
}

interface ManualSection {
  title: string;
  subtitle: string;
  blocks: ManualBlock[];
}

export const manualSections: Record<string, ManualSection> = {
  dashboard: {
    title: "📊 Dashboard",
    subtitle: "Visão geral do seu negócio",
    blocks: [
      { heading: "O que é o Dashboard?", text: "O Dashboard é a tela inicial do painel. Ele mostra um resumo rápido de como está o seu negócio: total de clientes, pedidos, faturamento e crescimento." },
      { heading: "Como funciona?", text: "Não é necessário fazer nada — basta abrir o painel para visualizar as informações atualizadas." },
      { heading: "Ações rápidas", text: "Os botões de ação rápida levam você diretamente para as seções mais usadas: Empresa, Campanhas, Cardápio e Relatórios." }
      
    ],
  },
  empresa: {
    title: "🏢 Informações da Empresa",
    subtitle: "Dados do seu estabelecimento",
    blocks: [
      { heading: "Para que serve?", text: "Aqui você cadastra e edita as informações da sua empresa: nome, telefone, WhatsApp e endereço completo." },
      { heading: "🤖 Dica importante", text: "Mantenha esses dados sempre atualizados. Se o endereço mudar e não for atualizado aqui, o agente vai informar o endereço antigo aos clientes." }

    ],
  },
  configuracoes: {
    title: "⚙️ Configurações",
    subtitle: "Controle o comportamento do agente de IA",
    blocks: [
      { heading: "Status do GoodZap", text: "O switch principal liga/desliga o agente de IA. Quando desligado, o agente para de responder mensagens no WhatsApp." },
      { heading: "Tempo de Entrega", text: "Define o tempo médio de entrega informado aos clientes. O agente usa esse valor ao responder perguntas sobre prazo de entrega." },
      { heading: "Tempo de Atraso", text: "Minutos adicionais de tolerância. Se há atrasos frequentes, aumente esse valor para que o agente informe prazos mais realistas." },
      { heading: "Tempo de Resposta", text: "Intervalo em minutos entre as respostas do agente. Evita que o agente responda muito rápido, simulando um atendimento mais humano." },
      { heading: "Distância Máxima de Entrega", text: "Raio em km para entregas. O agente verifica a distância do cliente e informa se está dentro ou fora da área de entrega." },
      { heading: "📞 Telefones Admin", text: "Números do atendente e do gerente. Quando o agente não consegue resolver algo, ele transfere ou notifica esses números." },
      { heading: "🎉 Promoções", text: "Promoções cadastradas aqui são injetadas no prompt do agente. Ele oferece essas promoções aos clientes durante a conversa." },
      { heading: "👋 Saudações", text: "Mensagens de boas-vindas personalizadas. O agente escolhe aleatoriamente entre as saudações ativas para iniciar conversas." },
      { heading: "🕐 Horários Extras", text: "Horários especiais de funcionamento. O agente consulta esses horários para informar se a empresa está aberta ou fechada." },
      { heading: "⭐ Números Especiais (VIP)", text: "Contatos que recebem tratamento diferenciado pelo agente. O agente reconhece esses números e pode oferecer um atendimento personalizado." },
      { heading: "🤖 Relação com o Agente IA", text: "Esta é a página mais importante para o controle do agente. Todas as configurações aqui são lidas pelo fluxo n8n e injetadas no prompt ou usadas como parâmetros de comportamento do agente." },
    ],
  },
  campanhas: {
    title: "📢 Campanhas",
    subtitle: "Promoções automáticas e recuperação de clientes",
    blocks: [
      { heading: "Promoção de Aniversário", text: "Configure mensagens automáticas de aniversário. O sistema verifica os aniversariantes do dia e envia mensagens personalizadas pelo WhatsApp." },
      { heading: "Recuperação de Clientes", text: "Crie campanhas para reconquistar clientes inativos. Defina o período de inatividade, a mensagem e a promoção a ser oferecida." },
      { heading: "🤖 Relação com o Agente IA", text: "As campanhas são executadas automaticamente pelo fluxo n8n. O agente pode mencionar promoções ativas durante conversas com clientes que se encaixam nos critérios da campanha." },
    ],
  },
  cardapio: {
    title: "🍽️ Cardápio",
    subtitle: "Gerencie pratos, bebidas e outros produtos",
    blocks: [
      { heading: "Pratos", text: "Cadastre os pratos do seu cardápio com nome, descrição e preço. Use o switch para marcar itens como disponíveis ou indisponíveis." },
      { heading: "Bebidas", text: "Cadastre bebidas com nome, tipo (refrigerante, suco, etc.), tamanho e valor. O switch de disponibilidade funciona da mesma forma." },
      { heading: "Outros Produtos", text: "Para sobremesas, acompanhamentos e outros itens que não se encaixam em pratos ou bebidas." },
      { heading: "🤖 Relação com o Agente IA", text: "O cardápio inteiro é injetado no prompt do agente via n8n. Quando um cliente pede o cardápio ou pergunta sobre um prato específico, o agente consulta essas informações.\n\nItens marcados como 'indisponível' são informados ao agente, que avisa o cliente que o item está temporariamente indisponível." },
      { heading: "Dica", text: "Atualize a disponibilidade em tempo real. Se acabou um ingrediente, desative o prato imediatamente — o agente já começa a informar os clientes." },
    ],
  },
  relatorios: {
    title: "📈 Relatórios",
    subtitle: "Análise de pedidos e faturamento",
    blocks: [
      { heading: "Visão Geral", text: "Veja o total de clientes, pedidos recentes, faturamento total e ticket médio do seu negócio." },
      { heading: "Lista de Pedidos", text: "Todos os pedidos recentes com opção de ver detalhes e imprimir comprovantes." },
      { heading: "🤖 Relação com o Agente IA", text: "Os relatórios são gerados a partir dos pedidos registrados pelo agente. Cada vez que o agente finaliza um pedido via WhatsApp, ele é salvo no banco de dados e aparece aqui." },
    ],
  },
  metricas: {
    title: "📊 Métricas de Vendas",
    subtitle: "Análise avançada de desempenho",
    blocks: [
      { heading: "O que são?", text: "Métricas detalhadas sobre vendas, incluindo gráficos de evolução, comparativos e análises de tendência." },
      { heading: "🤖 Relação com o Agente IA", text: "As métricas refletem o desempenho do agente em converter conversas em vendas. Use para avaliar a eficácia do agente e ajustar configurações." },
    ],
  },
  clientes: {
    title: "👥 Clientes",
    subtitle: "Base de clientes do seu negócio",
    blocks: [
      { heading: "Lista de Clientes", text: "Visualize todos os clientes cadastrados com informações de contato, endereço e histórico de compras." },
      { heading: "Métricas por Cliente", text: "Total de compras, valor total gasto e data do último pedido — calculados automaticamente a partir dos pedidos." },
      { heading: "Adicionar/Editar", text: "Você pode adicionar clientes manualmente ou editar informações existentes. Use o botão '+' para novo cliente." },
      { heading: "🤖 Relação com o Agente IA", text: "Os clientes são cadastrados automaticamente pelo agente quando fazem o primeiro pedido. O agente reconhece clientes recorrentes pelo número de WhatsApp e pode personalizar o atendimento." },
    ],
  },
  pedidos: {
    title: "🛒 Pedidos",
    subtitle: "Histórico completo de pedidos",
    blocks: [
      { heading: "Visualização", text: "Lista todos os pedidos com filtros por data e busca por nome/código. Cada pedido mostra cliente, valor, data e detalhes." },
      { heading: "Detalhes e Impressão", text: "Clique em um pedido para ver todos os detalhes. Use o botão de impressão para gerar um comprovante." },
      { heading: "🤖 Relação com o Agente IA", text: "Todos os pedidos são criados automaticamente pelo agente no fluxo n8n. Quando um cliente finaliza um pedido pelo WhatsApp, o agente salva todas as informações aqui." },
    ],
  },
  horarios: {
    title: "🕐 Horários",
    subtitle: "Horários de funcionamento",
    blocks: [
      { heading: "Dias da Semana", text: "Configure o horário de abertura e fechamento para cada dia da semana. Ative ou desative dias específicos." },
      { heading: "🤖 Relação com o Agente IA", text: "O agente consulta esses horários antes de processar pedidos. Se o cliente tentar fazer um pedido fora do horário, o agente informa que a empresa está fechada e qual o próximo horário de abertura." },
    ],
  },
  reservas: {
    title: "📅 Reservas",
    subtitle: "Gerenciamento de reservas",
    blocks: [
      { heading: "Como funciona?", text: "Gerencie reservas de mesas com data, horário, nome do cliente, WhatsApp, quantidade de pessoas e observações." },
      { heading: "🤖 Relação com o Agente IA", text: "O agente pode criar reservas automaticamente quando o cliente solicita pelo WhatsApp. As reservas aparecem aqui para gerenciamento e confirmação." },
    ],
  },
  geral: {
    title: "📖 Manual do Painel de Comando",
    subtitle: "Guia completo de uso do sistema GoodZap",
    blocks: [
      { heading: "O que é o GoodZap?", text: "O GoodZap é um painel de comando que controla um agente de inteligência artificial conectado ao WhatsApp da sua empresa. O agente atende clientes, recebe pedidos, informa o cardápio, verifica horários e muito mais — tudo automaticamente." },
      { heading: "Como funciona a integração?", text: "O painel está conectado a um fluxo no n8n (uma plataforma de automação). As informações que você cadastra aqui — cardápio, horários, promoções, dados da empresa — são lidas pelo fluxo e injetadas no prompt do agente de IA.\n\nIsso significa que, ao alterar qualquer dado neste painel, o agente automaticamente passa a usar as informações atualizadas nas próximas conversas." },
      { heading: "Fluxo de dados simplificado", text: "1. Você edita os dados no painel (ex: preço de um prato)\n2. O n8n lê esses dados do banco de dados\n3. Os dados são injetados no prompt do agente\n4. O agente usa os dados atualizados ao conversar com clientes\n5. Pedidos e interações são salvos de volta no banco de dados\n6. Você visualiza os resultados nos relatórios e métricas" },
      { heading: "Seções do painel", text: "• Dashboard — Visão geral do negócio\n• Empresa — Dados do estabelecimento (injetados no prompt)\n• Configurações — Controle do comportamento do agente\n• Campanhas — Promoções automáticas\n• Cardápio — Pratos, bebidas e produtos (injetados no prompt)\n• Relatórios — Análise de pedidos e faturamento\n• Métricas — Análise avançada de vendas\n• Clientes — Base de clientes\n• Pedidos — Histórico de pedidos\n• Horários — Horários de funcionamento\n• Reservas — Gestão de reservas" },
      { heading: "Dicas importantes", text: "✅ Mantenha os dados sempre atualizados — o agente usa em tempo real\n✅ Use o switch de disponibilidade no cardápio para itens temporariamente indisponíveis\n✅ Configure promoções nas Configurações para o agente oferecer aos clientes\n✅ Verifique os relatórios regularmente para acompanhar o desempenho\n✅ Os horários de funcionamento afetam quando o agente aceita pedidos" },
    ],
  },
};
