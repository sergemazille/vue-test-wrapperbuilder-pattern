import { Wrapper, createLocalVue, shallowMount } from '@vue/test-utils';

import Vue from 'vue';

export default class WrapperBuilder<T extends Vue> {
  data: any = () => ({});
  propsData: any = {};
  mocks: any = {};
  provide: any = {};

  constructor(private readonly ComponentVue: Record<string, any>, defaults?: Record<string, any>) {
    if (defaults) this.set(defaults);
  }

  buildWith(params?: Partial<Record<keyof WrapperBuilder<T>, any>>): Wrapper<T, Element> {
    if (params) this.set(params);

    return this.createWrapper();
  }

  build = this.buildWith; // syntactic sugar

  private set(params: Record<string, any>) {
    Object.entries(params).forEach(param => {
      const [key, value] = param as [keyof WrapperBuilder<T>, Record<string, any> | Function];

      switch (key) {
        case 'data':
          this.data = value;
          break;

        case 'provide':
          this.provide = this.updateProvideWith(value);
          break;

        default:
          this[key] = {
            ...this[key],
            ...value,
          };
      }
    });
  }

  private updateProvideWith(value: Record<string, any>) {
    return Object.entries(value).reduce((acc, [propertyKey, propertyValue]) => {
      const doesComponentHaveProperty = propertyKey in this.ComponentVue.options.inject;

      if (!doesComponentHaveProperty) {
        throw new Error(`No property nammed "${propertyKey}" can be injected into "${this.ComponentVue.name}". Please check the spelling.`);
      }

      const updatedPropertyValue = {
        ...acc[propertyKey],
        ...propertyValue,
      };

      acc[propertyKey] = typeof propertyValue === 'function' ? propertyValue : updatedPropertyValue;

      return acc;
    }, this.provide);
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
