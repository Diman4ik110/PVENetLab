from proxmoxer import ProxmoxAPI

proxmox = ProxmoxAPI('10.10.100.2', user='root@pam', password='718397Dm', verify_ssl=False)
# Проверка на доступность
nodes = proxmox.nodes.get()
print(nodes)