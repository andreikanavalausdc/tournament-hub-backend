import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeormConfig } from '@shared/config/typeorm.config';

export default new DataSource(new TypeormConfig().createTypeOrmOptions() as DataSourceOptions);
