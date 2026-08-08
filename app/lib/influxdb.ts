import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';

const url: string | undefined = process.env.INFLUXDB_URL;
const token: string | undefined  = process.env.INFLUXDB_TOKEN;
const org: string | undefined  = process.env.INFLUXDB_ORG;
const bucket: string | undefined  = process.env.INFLUXDB_ANALYTICS_BUCKET;

if (!url || !token || !org || !bucket) {
  throw new Error('InfluxDB environment variables are missing');
}

export const influxDB = new InfluxDB({
  url,
  token,
});

export const influxOrg: string = org;
export const influxBucket: string = bucket;

export const influxQueryApi: QueryApi = influxDB.getQueryApi(influxOrg);
export const influxWriteApi: WriteApi = influxDB.getWriteApi(
  influxOrg,
  influxBucket,
);
