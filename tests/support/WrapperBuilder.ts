import { Wrapper, createLocalVue, shallowMount } from '@vue/test-utils';

import Vue from 'vue';

export default class WrapperBuilder<T extends Vue> {
  data?: Function = () => ({});
  propsData?: any = {};
  mocks?: any = {};
  provide?: any = {};

  constructor(private readonly ComponentVue: Record<string, any>, defaults?: Record<string, any>) {
    if (defaults) this.set(defaults);
  }

  build(builderFields?: Partial<WrapperBuilder<T>>): Wrapper<T, Element> {
    if (builderFields) this.set(builderFields);

    return this.createWrapper();
  }

  private set(builderFields: Partial<WrapperBuilder<T>>) {
    this.assertProvideFieldIsValid(builderFields.provide);
    this.updateAllFieldsWith(builderFields);
  }

  private assertProvideFieldIsValid(provideField?: Record<string, object | Function>) {
    if (!provideField) return;

    Object.keys(provideField).forEach(propertyKey => {
      const doesComponentOwnProperty = propertyKey in this.ComponentVue.options.inject;

      if (!doesComponentOwnProperty) {
        throw new Error(
          `No property named "${propertyKey}" can be injected into "${this.ComponentVue.name}". Please check the spelling of this property.`
        );
      }
    });
  }

  private updateAllFieldsWith(builderFields: Partial<WrapperBuilder<T>>) {
    Object.entries(builderFields).forEach(field => {
      const [fieldKey, fieldValue] = field as [keyof WrapperBuilder<T>, Record<string, any> | Function];
      const existingFieldValue = this[fieldKey];

      this[fieldKey] = this.updateFieldWith(fieldValue, existingFieldValue);
    });
  }

  private updateFieldWith(
    newField: Record<string, object | Function> | Function = {},
    existingField: Record<string, object | Function> = {}
  ) {
    // most certainly "data" field
    if (typeof newField === 'function') {
      const existingFunction = (<unknown>existingField) as Function;

      return this.mergeFunctionReturningProperties(newField, existingFunction);
    }

    // other fields: propsData, provide, mocks
    const fieldProperties = Object.entries(newField);

    return fieldProperties.reduce((fieldAcc, [propertyKey, propertyValue]) => {
      const existingValue = fieldAcc[propertyKey];

      switch (typeof propertyValue) {
        case 'function':
          fieldAcc[propertyKey] = this.mergeFunctions(propertyValue, existingValue as Function);
          break;

        // property composed of multiple values
        case 'object':
          fieldAcc[propertyKey] = {
            ...existingValue,
            ...propertyValue,
          };
          break;

        // value is a simple primitive
        default:
          fieldAcc[propertyKey] = propertyValue;
          break;
      }

      return fieldAcc;
    }, existingField);
  }

  private mergeFunctionReturningProperties(newFunction?: Function, existingFunction?: Function) {
    return () => ({
      ...(existingFunction && existingFunction()),
      ...(newFunction && newFunction()),
    });
  }

  private mergeFunctions(newFunction: Function, existingFunction: Function) {
    const getProperties = this.mergeFunctionReturningProperties(newFunction, existingFunction);
    const doesReturnProperties = Object.keys(getProperties()).length;

    return doesReturnProperties ? getProperties : newFunction;
  }

  private createWrapper() {
    const { ComponentVue, data, propsData, mocks, provide } = this;

    const localVue = createLocalVue();

    return shallowMount<T>(ComponentVue, {
      data,
      propsData,
      provide,
      localVue,
      mocks,
    });
  }
}
