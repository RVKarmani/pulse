create table sentiment_data (
    source_id varchar(24) not null,
    data_id varchar(45) not null,
    ts timestamp not null,
    sentiment CHAR(3) not null,
    keyword varchar(45) not null,
) with ('materialized' = 'true');

create materialized view sentiment_aggr (
    source_id,
    sentiment,
    count
) as
    select source_id, sentiment, count(data_id) as count from sentiment_data group by source_id, sentiment;
