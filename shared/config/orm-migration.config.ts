import { TypeormConfig } from '@shared/config/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';

export default new DataSource(new TypeormConfig().createTypeOrmOptions() as DataSourceOptions);
