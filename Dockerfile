# ============================================
# STAGE 1: Build (dependencies + source)
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev)
RUN npm ci --silent && \
    npm cache clean --force

# Copy application source
COPY src ./src


# ============================================
# STAGE 2: Runtime (lean production image)
# ============================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Install dumb-init para melhor gerenciamento de sinais
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy apenas dependências de produção do builder
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --silent && \
    npm cache clean --force

# Copy source code
COPY --from=builder /app/src ./src

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app

# Trocar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Labels de metadata
LABEL org.opencontainers.image.title="Cloud Order API"
LABEL org.opencontainers.image.description="REST API para gestão de pedidos com autenticação JWT"
LABEL org.opencontainers.image.vendor="Unifor"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/unifor/cloud-order"
LABEL org.opencontainers.image.documentation="https://github.com/unifor/cloud-order/blob/production/README.md"

# Usar dumb-init como init para melhor gerenciamento de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão
CMD ["node", "src/app.js"]
