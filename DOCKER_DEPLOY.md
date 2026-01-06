# Docker 部署指南

## 快速启动

### 使用 Docker Compose（推荐）

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

访问：`http://localhost:3000`

---

### 使用 Docker 命令

```bash
# 构建镜像
docker build -t perler-beads .

# 运行容器
docker run -d \
  --name perler-beads-app \
  -p 3000:3000 \
  perler-beads

# 查看日志
docker logs -f perler-beads-app

# 停止容器
docker stop perler-beads-app

# 删除容器
docker rm perler-beads-app
```

---

## 配置说明

### 环境变量

在 `docker-compose.yml` 中可以配置以下环境变量：

```yaml
environment:
  - NODE_ENV=production          # 运行环境
  - PORT=3000                    # 端口号
  - HOSTNAME=0.0.0.0            # 主机名
```

### 端口映射

默认映射 `3000:3000`，可以修改为其他端口：

```yaml
ports:
  - "8080:3000"  # 主机端口:容器端口
```

### 资源限制

在 `docker-compose.yml` 中已配置：
- CPU 限制：1 核
- 内存限制：1GB
- 预留资源：0.5 核 CPU，512MB 内存

可根据服务器配置调整。

---

## 健康检查

容器包含健康检查：
- 检查间隔：30秒
- 超时时间：10秒
- 重试次数：3次
- 启动等待：40秒

查看健康状态：

```bash
docker ps
# 或
docker inspect perler-beads-app --format='{{.State.Health.Status}}'
```

---

## 常见问题

### 1. 构建失败

**问题**：依赖安装失败

**解决方案**：
```bash
# 清理缓存重新构建
docker-compose build --no-cache
```

### 2. 端口被占用

**问题**：`port is already allocated`

**解决方案**：
```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "3001:3000"  # 改为其他端口
```

### 3. 容器启动后无法访问

**检查步骤**：
```bash
# 1. 查看容器状态
docker ps

# 2. 查看日志
docker-compose logs

# 3. 进入容器检查
docker exec -it perler-beads-app sh
```

---

## 生产环境部署建议

### 1. 使用反向代理

推荐使用 Nginx 或 Traefik 作为反向代理：

```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 添加 HTTPS

使用 Let's Encrypt 配置 SSL 证书。

### 3. 持久化数据

如需持久化数据，添加 volume：

```yaml
volumes:
  - ./data:/app/data
```

### 4. 日志管理

配置日志驱动：

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 清理旧镜像
docker image prune -f
```

---

## 监控和维护

### 查看资源使用

```bash
docker stats perler-beads-app
```

### 查看容器信息

```bash
docker inspect perler-beads-app
```

### 备份和恢复

```bash
# 导出镜像
docker save perler-beads > perler-beads.tar

# 导入镜像
docker load < perler-beads.tar
```

---

## 卸载

```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi perler-beads

# 清理未使用的资源
docker system prune -a
```

