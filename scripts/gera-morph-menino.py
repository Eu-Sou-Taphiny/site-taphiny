#!/usr/bin/env python3
"""
Gera a TIRA DE QUADROS (sprite) do bonequinho voltando a ser crianca.

Por que sprite e nao crossfade entre duas imagens: cruzar adulto e crianca por
opacidade mostra as duas silhuetas ao mesmo tempo (efeito fantasma). Com quadros
intermediarios o corpo realmente encurta, sem sobreposicao.

Cada quadro reaproveita a pintura original (mesma aquarela, mesma cor) e muda so
as proporcoes, interpolando adulto (t=0) -> crianca (t=1). Faixas sao reescaladas
apenas na vertical, entao a largura nas fronteiras nao muda e nao aparece degrau;
a cabeca recebe um alargamento horizontal que decai a 1.0 na altura do pescoco.

Tudo em alpha premultiplicado (uma vez no inicio, desfeito uma vez no fim) pra
nao criar franja escura nas bordas ao reescalar.

Saida: public/assets/menino-morph.webp — N quadros lado a lado, todos com os pes
na mesma linha de chao e no mesmo eixo vertical.
"""
import numpy as np
from PIL import Image

SRC = "public/assets/menino.png"
OUT = "public/assets/menino-morph.webp"

QUADROS = 9          # 0 = adulto, ultimo = crianca
LARG_QUADRO = 120    # exibido com no maximo 36px de largura; 120 cobre retina 3x

TOPO, BASE = 6, 969
PESCOCO, QUADRIL, TOBILLO = 145, 593, 868
CABECA = PESCOCO - TOPO

# alvos da crianca (t=1)
T_TRONCO, T_PERNAS, T_PES = 0.72, 0.55, 0.80
T_CABECA_LARG = 1.14
T_ALTURA_REL = 0.68


def para_premultiplicado(im):
    arr = np.asarray(im.convert("RGBA")).astype(np.float64)
    a = arr[:, :, 3:4] / 255.0
    arr[:, :, :3] *= a
    return arr


def de_premultiplicado(arr):
    out = arr.copy()
    a = out[:, :, 3:4] / 255.0
    np.divide(out[:, :, :3], a, out=out[:, :, :3], where=a > 1e-4)
    out[a[:, :, 0] <= 1e-4] = 0
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def img_pm(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def escala_v(arr, nova_altura):
    im = img_pm(arr).resize((arr.shape[1], nova_altura), Image.LANCZOS)
    return np.asarray(im).astype(np.float64)


def alarga_cabeca(arr, fator_topo, eixo):
    h, w = arr.shape[:2]
    if abs(fator_topo - 1.0) < 1e-6:
        return arr
    out = np.zeros_like(arr)
    for y in range(h):
        t = y / max(1, h - 1)
        s = fator_topo + (1.0 - fator_topo) * (t ** 1.6)
        nw = max(1, int(round(w * s)))
        linha = img_pm(arr[y:y + 1]).resize((nw, 1), Image.LANCZOS)
        la = np.asarray(linha).astype(np.float64)
        dx = int(round(eixo - eixo * s))
        x0d, x1d = max(0, dx), min(w, dx + nw)
        x0s, x1s = max(0, -dx), max(0, -dx) + (x1d - x0d)
        if x1d > x0d:
            out[y:y + 1, x0d:x1d] = la[:, x0s:x1s]
    return out


def lerp(a, b, t):
    return a + (b - a) * t


def quadro(base_pm, eixo, t):
    """Monta um quadro na proporcao interpolada t (0=adulto, 1=crianca)."""
    esc = [1.0, lerp(1.0, T_TRONCO, t), lerp(1.0, T_PERNAS, t), lerp(1.0, T_PES, t)]
    faixas = [(TOPO, PESCOCO), (PESCOCO, QUADRIL), (QUADRIL, TOBILLO), (TOBILLO, BASE + 1)]

    partes = []
    for i, (y0, y1) in enumerate(faixas):
        f = base_pm[y0:y1].copy()
        if esc[i] != 1.0:
            f = escala_v(f, max(1, int(round((y1 - y0) * esc[i]))))
        if i == 0:
            f = alarga_cabeca(f, lerp(1.0, T_CABECA_LARG, t), eixo)
        partes.append(f)

    corpo = np.concatenate(partes, axis=0)

    # encolhe pro tamanho absoluto (adulto ~170cm -> crianca ~115cm)
    alvo_h = int(round(964 * lerp(1.0, T_ALTURA_REL, t)))
    W = base_pm.shape[1]
    corpo_im = img_pm(corpo).resize((max(1, int(round(W * alvo_h / corpo.shape[0]))), alvo_h), Image.LANCZOS)
    corpo = np.asarray(corpo_im).astype(np.float64)

    # canvas do tamanho do adulto: pes na linha de chao, mesmo eixo vertical
    canvas = np.zeros((base_pm.shape[0], W, 4), dtype=np.float64)
    col = np.where(corpo[:, :, 3].max(axis=0) > 10)[0]
    novo_eixo = (col.min() + col.max()) / 2 if len(col) else corpo.shape[1] / 2
    dx = int(round(eixo - novo_eixo))
    dy = BASE + 1 - alvo_h
    ch, cw = corpo.shape[:2]
    x0d, x1d = max(0, dx), min(W, dx + cw)
    x0s = max(0, -dx)
    canvas[dy:dy + ch, x0d:x1d] = corpo[:, x0s:x0s + (x1d - x0d)]
    return canvas


def main():
    im = Image.open(SRC).convert("RGBA")
    W, H = im.size
    base_pm = para_premultiplicado(im)

    al = np.asarray(im)[:, :, 3]
    def centro(y0, y1):
        col = np.where(al[y0:y1].max(axis=0) > 40)[0]
        return (col.min() + col.max()) / 2
    eixo = round((centro(40, 100) + centro(650, 800)) / 2)

    alt_q = round(H * LARG_QUADRO / W)
    tira = Image.new("RGBA", (LARG_QUADRO * QUADROS, alt_q), (0, 0, 0, 0))

    for i in range(QUADROS):
        t = i / (QUADROS - 1)
        # curva suave: o corpo muda pouco no comeco e resolve no fim
        q = de_premultiplicado(quadro(base_pm, eixo, t * t * (3 - 2 * t)))
        q = q.resize((LARG_QUADRO, alt_q), Image.LANCZOS)
        tira.paste(q, (i * LARG_QUADRO, 0))
        print(f"quadro {i}/{QUADROS-1}  t={t:.2f}")

    tira.save(OUT, "WEBP", quality=82, method=6)
    import os
    print(f"\n{OUT}: {tira.size[0]}x{tira.size[1]}, {QUADROS} quadros, {os.path.getsize(OUT)} bytes")
    print(f"cada quadro: {LARG_QUADRO}x{alt_q}  (eixo x={eixo})")


if __name__ == "__main__":
    main()
