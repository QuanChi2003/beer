const { db } = require('../pgdb');
async function buildReports(range){
  let trunc='day'; if(range==='weekly') trunc='week'; if(range==='monthly') trunc='month'; if(range==='yearly') trunc='year';
  const rows=(await db.query(`
    select to_char(date_trunc($1, created_at), case when $1='day' then 'YYYY-MM-DD' when $1='week' then 'IYYY-"W"IW' when $1='month' then 'YYYY-MM' else 'YYYY' end) as period,
           count(*) as orders,
           sum(total) as revenue,
           sum(profit) as gross_profit,
           sum(profit - shipping_cost - extra_cost) as net_profit
    from orders where status='completed' group by 1 order by 1 desc limit 100
  `,[trunc])).rows; return rows;
}
module.exports={buildReports};
