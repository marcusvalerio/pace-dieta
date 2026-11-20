-- Pace · dados de referência: biblioteca de alimentos (ícones) e conquistas.
-- Valores nutricionais ficam vazios até virem de uma tabela oficial (ex.: TACO).

insert into alimentos (slug, nome, grupo, icone) values
('maca','Maçã','fruta_verdura','maca'),('banana','Banana','fruta_verdura','banana'),
('laranja','Laranja','fruta_verdura','laranja'),('limao','Limão','fruta_verdura','limao'),
('morango','Morango','fruta_verdura','morango'),('uva','Uva','fruta_verdura','uva'),
('melancia','Melancia','fruta_verdura','melancia'),('cenoura','Cenoura','fruta_verdura','cenoura'),
('brocolis','Brócolis','fruta_verdura','brocolis'),('folhas','Folhas','fruta_verdura','folhas'),
('tomate','Tomate','fruta_verdura','tomate'),('milho','Milho','fruta_verdura','milho'),
('pimentao','Pimentão','fruta_verdura','pimentao'),('couve','Couve','fruta_verdura','couve'),
('ovo','Ovo','proteina','ovo'),('ovo-frito','Ovo frito','proteina','ovo-frito'),
('frango','Frango','proteina','frango'),('peixe','Peixe','proteina','peixe'),
('carne','Carne','proteina','carne'),('queijo','Queijo','proteina','queijo'),
('leite','Leite','proteina','leite'),('iogurte','Iogurte','proteina','iogurte'),
('whey','Whey','proteina','whey'),('arroz','Arroz','carboidrato','arroz'),
('feijao','Feijão','carboidrato','feijao'),('pao','Pão','carboidrato','pao'),
('aveia','Aveia','carboidrato','aveia'),('batata','Batata','carboidrato','batata'),
('abacate','Abacate','gordura','abacate'),('castanhas','Castanhas','gordura','castanhas'),
('azeite','Azeite','gordura','azeite'),('cafe','Café','bebida','cafe');

insert into conquistas (slug, nome, tipo, nivel, regra) values
('ritmo-4-semanas','4 semanas no ritmo','sequencia',1,'{"semanas":4}'),
('ritmo-12-semanas','12 semanas no ritmo','sequencia',2,'{"semanas":12}'),
('ritmo-1-ano','1 ano no ritmo','sequencia',3,'{"semanas":52}'),
('agua-semana','12 litros na semana','semana',null,'{"agua_ml":12000}'),
('proteina-7-dias','Proteína 7 dias','semana',null,'{"dias_meta_proteina":7}'),
('lista-completa','Lista completa','semana',null,'{"lista_100":true}'),
('fruta-no-cafe','7 dias com fruta no café','tematica',null,'{"refeicao":"cafe","grupo":"fruta_verdura","dias":7}');
