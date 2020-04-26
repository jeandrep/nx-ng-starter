import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestModuleMetadata } from '@angular/core/testing';

import { MocksCoreModule } from '../../mocks-core.module';

/**
 * New TestBed metadata getter type.
 */
export type NewTestBedMetadata = (metadata?: TestModuleMetadata) => TestModuleMetadata;
/**
 * New TestBed metadata getter.
 * Should be used to provide additional metadata to default test bed config.
 * Provide a result as a parameter to getTestBedConfig method.
 */
export const newTestBedMetadata: NewTestBedMetadata = (metadata?: TestModuleMetadata) => {
  const imports = !metadata ? [] : !metadata.imports ? [] : [...metadata.imports];
  const declarations = !metadata ? [] : !metadata.declarations ? [] : [...metadata.declarations];
  const providers = !metadata ? [] : !metadata.providers ? [] : [...metadata.providers];
  const schemas = !metadata ? [] : !metadata.schemas ? [] : [...metadata.schemas];
  return {
    imports,
    declarations,
    providers,
    schemas,
  };
};

/**
 * TestBed config getter type.
 */
export type TestBedConfigGetter = (metadata: TestModuleMetadata) => TestModuleMetadata;
/**
 * TestBed configuration getter.
 * @param metadata additional test bed metadata
 */
export const getTestBedConfig: TestBedConfigGetter = (
  metadata: TestModuleMetadata = newTestBedMetadata(),
) =>
  new Object({
    declarations: [...metadata.declarations],
    imports: [MocksCoreModule.forRoot(), ...metadata.imports],
    providers: [...metadata.providers],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, ...metadata.providers],
  });
