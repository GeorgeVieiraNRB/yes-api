# TODO - Backend

## Base Do Projeto

- [ ] Definir stack backend oficial do projeto, incluindo framework HTTP, ORM Prisma, validação de entrada, autenticação e ferramenta de testes.
- [ ] Configurar estrutura de pastas para módulos de domínio, rotas/controllers, services/use-cases, repositories, middlewares, schemas de validação e testes.
- [ ] Configurar variáveis de ambiente obrigatórias, como `DATABASE_URL`, segredo JWT, origem CORS, configurações de e-mail, Redis/cache e ambiente de execução.
- [ ] Criar configuração de logs estruturados para requisições, erros, autenticação e eventos críticos de negócio.
- [ ] Padronizar respostas de erro da API com código, mensagem, detalhes opcionais e identificador de rastreio.

## Banco De Dados E Prisma

- [ ] Mover ou sincronizar o schema documentado em `docs/prisma/schema.prisma` com o schema Prisma usado pela aplicação.
- [ ] Validar o schema Prisma com `prisma validate`.
- [ ] Criar migrations iniciais para todas as entidades do contexto atual.
- [ ] Revisar índices mínimos para login, busca de pedidos, aprovação, perfis, status e catálogo de preços.
- [ ] Definir estratégia para UUID v7 no banco e confirmar compatibilidade com Prisma/PostgreSQL.
- [ ] Criar camada de acesso ao banco com Prisma Client e tratamento centralizado de erros conhecidos.
- [ ] Definir política de soft delete ou exclusão definitiva para entidades sensíveis.

## Seeds

- [ ] Criar seed inicial de `Status` de pedidos.
- [ ] Criar seed inicial de `Profile`, incluindo perfis administrativos, comerciais, financeiros, gerenciais e logísticos.
- [ ] Criar usuário administrador inicial com senha segura via variável de ambiente.
- [ ] Criar seed de `ApprovalPolicy`, `ApprovalStep` e `ApprovalStepProfile` para o fluxo de aprovação de pedidos.
- [ ] Criar seed de dados mínimos para catálogo de preços, condições de pagamento e filial, se necessários para testar pedidos.
- [ ] Garantir que seeds sejam idempotentes, podendo rodar mais de uma vez sem duplicar dados.

## Autenticação E Sessão

- [ ] Implementar login por `username` ou `email` com senha hash.
- [ ] Usar algoritmo seguro para hash de senha, como Argon2id ou bcrypt com custo adequado.
- [ ] Implementar emissão de access token e refresh token.
- [ ] Persistir refresh tokens de forma segura, com rotação e revogação.
- [ ] Criar rota de logout para revogar refresh token.
- [ ] Criar middleware de autenticação para proteger rotas privadas.
- [ ] Criar middleware de autorização por perfil usando `UserProfile.isActive`.
- [ ] Definir tempo de expiração dos tokens por ambiente.
- [ ] Bloquear login de usuário inativo, caso o campo de status do usuário seja adicionado.

## Redefinição De Senha

- [ ] Criar endpoint para solicitar redefinição de senha por e-mail.
- [ ] Gerar token de redefinição com entropia suficiente e armazenar somente hash do token.
- [ ] Definir expiração curta para `passwordResetExpires`.
- [ ] Enviar e-mail com link de redefinição usando provedor configurável.
- [ ] Criar endpoint para validar token de redefinição.
- [ ] Criar endpoint para trocar senha usando token válido.
- [ ] Invalidar token após uso.
- [ ] Revogar sessões e refresh tokens ativos após troca de senha.
- [ ] Aplicar rate limit na solicitação de redefinição para evitar enumeração e abuso.
- [ ] Responder sempre de forma genérica na solicitação de redefinição, sem confirmar se o e-mail existe.

## Rotas Principais

- [ ] Criar rotas de saúde, como `GET /health` e `GET /ready`.
- [ ] Criar rotas de autenticação: login, refresh, logout, solicitar redefinição e redefinir senha.
- [ ] Criar rotas de usuários: criar, listar, buscar, atualizar, ativar/desativar e gerenciar perfis.
- [ ] Criar rotas de perfis: listar, criar, atualizar e vincular permissões futuras.
- [ ] Criar rotas de contas, contatos e endereços.
- [ ] Criar rotas de produtos, catálogos de preço e itens de catálogo.
- [ ] Criar rotas de orçamentos e itens de orçamento.
- [ ] Criar rotas de pedidos, incluindo criação a partir de orçamento.
- [ ] Criar rotas de aprovação de pedidos: submeter, listar pendentes, aprovar, rejeitar, cancelar e consultar histórico.
- [ ] Criar rotas de filiais, estoques e produtos em estoque.
- [ ] Definir paginação, filtros, ordenação e busca textual nas listagens.

## Fluxo De Aprovação De Pedidos

- [ ] Selecionar `ApprovalPolicy` ativa por valor final, moeda e regras de negócio do pedido.
- [ ] Ao submeter pedido, preencher `approvalPolicyId`, `approvalRequestedByUserId`, `approvalStatus`, `approvalSubmittedAt` e `approvalObservation`.
- [ ] Criar `OrderApproval` para cada `ApprovalStep` da política selecionada.
- [ ] Garantir que apenas a etapa corrente possa receber decisões.
- [ ] Validar que o usuário aprovador possui `UserProfile` ativo permitido em `ApprovalStepProfile`.
- [ ] Registrar `ApprovalDecision` com usuário, perfil usado, decisão, observação e data.
- [ ] Aprovar etapa quando atingir `requiredApprovals`.
- [ ] Rejeitar fluxo quando uma etapa for rejeitada, salvo se a regra de negócio exigir múltiplas rejeições.
- [ ] Cancelar etapas pendentes quando o fluxo for rejeitado ou cancelado.
- [ ] Atualizar `Order.approvalStatus` e `approvalResolvedAt` ao finalizar o fluxo.
- [ ] Impedir decisão duplicada do mesmo usuário na mesma etapa.
- [ ] Decidir regra para impedir ou permitir autoaprovação do solicitante.

## Segurança Mínima

- [ ] Configurar CORS com origens permitidas por ambiente.
- [ ] Adicionar headers de segurança HTTP.
- [ ] Implementar rate limiting em autenticação, redefinição de senha e rotas sensíveis.
- [ ] Validar todos os payloads de entrada com schemas tipados.
- [ ] Sanitizar e normalizar campos como e-mail, CPF/CNPJ, telefone, CEP e códigos de produto.
- [ ] Garantir que erros internos não vazem stack trace em produção.
- [ ] Usar HTTPS em produção e cookies seguros se refresh token for transportado por cookie.
- [ ] Proteger segredos por variáveis de ambiente e nunca versionar credenciais.
- [ ] Implementar auditoria para login, falhas de login, redefinição de senha, mudanças de perfil e decisões de aprovação.
- [ ] Criar política de permissões mínimas para cada perfil.

## Cache E Redis

- [ ] Definir banco de cache, preferencialmente Redis.
- [ ] Configurar conexão Redis por variável de ambiente.
- [ ] Usar cache para dados pouco voláteis, como perfis, status, catálogos e políticas de aprovação ativas.
- [ ] Definir TTLs por tipo de dado.
- [ ] Invalidar cache ao alterar perfis, políticas de aprovação, catálogos e status.
- [ ] Usar Redis para rate limiting distribuído.
- [ ] Usar Redis para blacklist/revogação de tokens, se a estratégia de sessão exigir.
- [ ] Definir comportamento da API quando Redis estiver indisponível.

## E-mail E Notificações

- [ ] Configurar serviço de envio de e-mail.
- [ ] Criar template de redefinição de senha.
- [ ] Criar template de pedido aguardando aprovação.
- [ ] Criar template de pedido aprovado ou rejeitado.
- [ ] Enviar notificação para perfis aprovadores quando uma etapa ficar pendente.
- [ ] Evitar envio duplicado de e-mails em retentativas.

## Observabilidade E Operação

- [ ] Criar logs de auditoria para ações críticas.
- [ ] Adicionar métricas básicas de latência, erros, autenticações e aprovações.
- [ ] Criar endpoint de readiness verificando banco e cache.
- [ ] Configurar tratamento global de exceções.
- [ ] Definir política de backup e restauração do banco.
- [ ] Definir rotina de limpeza para tokens expirados e registros temporários.
- [ ] Documentar comandos de setup, migration, seed, teste e execução local.

## Documentação Da API

- [ ] Criar especificação OpenAPI/Swagger.
- [ ] Documentar autenticação e refresh token.
- [ ] Documentar payloads das rotas principais.
- [ ] Documentar códigos de erro padronizados.
- [ ] Documentar fluxo de aprovação de pedidos com exemplos.
- [ ] Documentar variáveis de ambiente obrigatórias.

## Testes

- [ ] Configurar banco de teste isolado.
- [ ] Criar testes unitários para serviços de autenticação, senha e autorização por perfil.
- [ ] Criar testes de integração para rotas de autenticação.
- [ ] Criar testes de integração para fluxo completo de aprovação de pedido.
- [ ] Criar testes de validação para payloads inválidos.
- [ ] Criar testes para seleção de política de aprovação por valor e moeda.
- [ ] Criar testes para revogação de perfil e bloqueio de aprovação.
- [ ] Criar testes de seed idempotente.
