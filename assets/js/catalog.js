/**
 * Cara Core Informática — renderizador do catálogo canônico.
 *
 * Lê window.CARACORE_CATALOG (assets/js/catalog-data.js) e preenche os
 * contêineres marcados na página:
 *   [data-cc-catalog]         tabela canônica (nome, categoria, estágio, preços)
 *   [data-cc-catalog-legend]  legenda dos quatro estágios
 *   [data-cc-catalog-count]   contagem por estágio
 *   [data-cc-catalog-notes]   regras de nomenclatura
 *
 * Sem dados ou sem contêiner, a página permanece intacta (no-op).
 */
(function () {
  'use strict';

  var dados = window.CARACORE_CATALOG;

  function esc(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function achar(lista, id) {
    for (var i = 0; i < lista.length; i += 1) {
      if (lista[i].id === id) {
        return lista[i];
      }
    }
    return null;
  }

  function porEstagio(estagioId) {
    var total = 0;
    for (var i = 0; i < dados.produtos.length; i += 1) {
      if (dados.produtos[i].estagio === estagioId) {
        total += 1;
      }
    }
    return total;
  }

  function linha(produto) {
    var estagio = achar(dados.estagios, produto.estagio) || { rotulo: produto.estagio };
    var categoria = achar(dados.categorias, produto.categoria) || { rotulo: produto.categoria };

    return '<tr>' +
      '<th scope="row" class="cc-cat-produto">' +
        '<a href="' + esc(produto.url) + '" target="_blank" rel="noopener">' + esc(produto.nome) + '</a>' +
        '<span class="cc-cat-meta">' + esc(produto.loja) + '</span>' +
        '<span class="cc-cat-meta cc-cat-meta--nota">' + esc(produto.nota) + '</span>' +
      '</th>' +
      '<td>' + esc(categoria.rotulo) + '</td>' +
      '<td>' +
        '<span class="cc-cat-mat cc-cat-mat--' + esc(produto.estagio) + '">' + esc(estagio.rotulo) + '</span>' +
        '<span class="cc-cat-meta">' + esc(produto.versao) + '</span>' +
        '<span class="cc-cat-meta cc-cat-meta--nota">' + esc(produto.detalhe) + '</span>' +
      '</td>' +
      '<td>' + esc(produto.free) + '</td>' +
      '<td>' + esc(produto.pago) + '</td>' +
      '<td class="cc-cat-preco"><strong>' + esc(produto.preco) + '</strong>' +
        '<span class="cc-cat-meta">' + esc(produto.pagamento) + '</span>' +
      '</td>' +
    '</tr>';
  }

  function tabela() {
    var linhas = [];
    for (var i = 0; i < dados.produtos.length; i += 1) {
      linhas.push(linha(dados.produtos[i]));
    }

    return '<div class="table-responsive">' +
      '<table class="table table-sm align-middle cc-cat-table">' +
      '<caption>Catálogo canônico — nome público, estágio, edição gratuita e preço por produto. ' +
        'Atualizado em ' + esc(dados.atualizadoEm) + '. A loja de cada produto continua sendo a fonte comercial.</caption>' +
      '<thead><tr>' +
        '<th scope="col">Produto</th>' +
        '<th scope="col">Categoria</th>' +
        '<th scope="col">Estágio</th>' +
        '<th scope="col">Free / gratuito</th>' +
        '<th scope="col">Pago</th>' +
        '<th scope="col">Preço</th>' +
      '</tr></thead>' +
      '<tbody>' + linhas.join('') + '</tbody>' +
      '</table></div>';
  }

  function legenda() {
    var itens = [];
    for (var i = 0; i < dados.estagios.length; i += 1) {
      var estagio = dados.estagios[i];
      itens.push('<li class="cc-cat-legend-item">' +
        '<span class="cc-cat-mat cc-cat-mat--' + esc(estagio.id) + '">' + esc(estagio.rotulo) + '</span>' +
        '<span class="cc-cat-legend-text">' + esc(estagio.descricao) + '</span>' +
      '</li>');
    }
    return '<ul class="cc-cat-legend" role="list">' + itens.join('') + '</ul>';
  }

  function contagem() {
    var partes = [];
    for (var i = 0; i < dados.estagios.length; i += 1) {
      var total = porEstagio(dados.estagios[i].id);
      if (total > 0) {
        partes.push(total + ' ' + dados.estagios[i].rotulo.toLowerCase());
      }
    }
    return '<strong>' + dados.produtos.length + ' produtos no catálogo</strong> · ' + partes.join(' · ') + '.';
  }

  function notas() {
    var itens = [];
    for (var i = 0; i < dados.notas.length; i += 1) {
      itens.push('<li>' + esc(dados.notas[i]) + '</li>');
    }
    return '<ul class="cc-cat-notes">' + itens.join('') + '</ul>';
  }

  function preencher(seletor, html) {
    var alvos = document.querySelectorAll(seletor);
    for (var i = 0; i < alvos.length; i += 1) {
      alvos[i].innerHTML = html;
    }
  }

  function iniciar() {
    if (!dados || !dados.produtos || !dados.produtos.length) {
      return;
    }
    preencher('[data-cc-catalog]', tabela());
    preencher('[data-cc-catalog-legend]', legenda());
    preencher('[data-cc-catalog-count]', contagem());
    preencher('[data-cc-catalog-notes]', notas());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
