export function limparCep(cep:string): string {
    if (!cep) return ""

    return cep.replace(/\D/g,"")
}