-- numeric() volta como string via PostgREST; troca pra double precision
-- pra vir como number no JSON (precisão de sobra pra valores em reais).
alter table transactions alter column amount type double precision;
alter table categories alter column budget type double precision;
alter table goals alter column current_amount type double precision;
alter table goals alter column target type double precision;
