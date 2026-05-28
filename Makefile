# Quickfund — dev tasks
# Port is fixed by package.json scripts (next dev -p 7002 -H 0.0.0.0).
PORT ?= 7002

.DEFAULT_GOAL := help
.PHONY: dev dev-off dev-stop dev-logs dev-status help

# Start the dev server fully detached (survives terminal close AND Ctrl-C),
# then tail the logs. Ctrl-C only stops the tail — the server keeps running.
dev:
	@echo ">> Freeing port $(PORT) (if busy)…"
	-@lsof -ti tcp:$(PORT) 2>/dev/null | xargs -r kill -9 >/dev/null 2>&1 || true
	-@fuser -k $(PORT)/tcp >/dev/null 2>&1 || true
	@sleep 1
	@echo ">> Starting dev server (detached) → http://localhost:$(PORT)"
	@setsid sh -c 'exec npm run dev' >dev.log 2>&1 </dev/null & echo $$! >.dev.pid
	@sleep 2
	@echo ">> Server running (pid $$(cat .dev.pid)). Ctrl-C quitte les logs, PAS le serveur."
	@echo ">> Arrêter: 'make dev-off'  |  Revoir les logs: 'make dev-logs'"
	@echo "----------------------------------------------------------------------"
	@tail -f dev.log

# Stop the dev server and free the port.
dev-off:
	-@lsof -ti tcp:$(PORT) 2>/dev/null | xargs -r kill -9 >/dev/null 2>&1 || true
	-@fuser -k $(PORT)/tcp >/dev/null 2>&1 || true
	@rm -f .dev.pid
	@echo ">> Serveur arrêté (port $(PORT) libéré)."

# Alias for dev-off.
dev-stop: dev-off

# Follow the logs in real time (Ctrl-C to stop watching).
dev-logs:
	@tail -f dev.log

# Show whether the dev server is listening on the port.
dev-status:
	@ss -tlnp 2>/dev/null | grep -q ":$(PORT)" && echo "Serveur en écoute sur le port $(PORT)." || echo "Rien sur le port $(PORT)."

help:
	@echo "Quickfund — commandes dev (port $(PORT)) :"
	@echo "  make dev         Démarre le serveur (détaché) puis affiche les logs"
	@echo "  make dev-logs    Affiche les logs en direct (tail -f dev.log)"
	@echo "  make dev-off     Arrête le serveur et libère le port"
	@echo "  make dev-status  Montre ce qui occupe le port"
	@echo "  make help        Affiche cette aide (défaut)"
