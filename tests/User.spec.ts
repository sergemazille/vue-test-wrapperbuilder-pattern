import { shallowMount } from '@vue/test-utils';
import UserComponent from '@/components/User.vue';

class WrapperBuilder {
  data: any = () => ({});
  propsData: any = { userId: 0 };
  favoriteService: any = { save: jest.fn() };
  userService: any = {
    findById: jest.fn().mockReturnValue({ firstname: 'John', lastname: 'Doe' }),
  };

  static buildWith(params?: Partial<Record<keyof WrapperBuilder, any>>) {
    const instance = new WrapperBuilder();

    if (params) {
      instance.set(params);
    }

    return instance.createWrapper();
  }

  static build = WrapperBuilder.buildWith; // syntactic sugar

  private set(params: Record<string, any>) {
    Object.entries(params).forEach(param => {
      const [key, value] = param as [keyof WrapperBuilder, Record<string, any> | Function];

      if (typeof value === 'function') {
        this[key] = value;
      } else {
        this[key] = {
          ...this[key],
          ...value,
        };
      }
    });
  }

  private createWrapper() {
    const { data, propsData, favoriteService, userService } = this;

    return shallowMount<UserComponent>(UserComponent, {
      data,
      propsData,
      provide: { favoriteService, userService },
    });
  }
}

describe('User', () => {
  it('should instantiate a User component', () => {
    const wrapper = WrapperBuilder.build();

    expect(wrapper.exists()).toBeTruthy();
  });

  it('should find a user by its id', () => {
    const userService = { findById: jest.fn().mockReturnValue({}) };
    const propsData = { userId: 12345 };
    const params = { userService, propsData };

    WrapperBuilder.buildWith(params);

    expect(userService.findById).toHaveBeenCalledWith(12345);
  });

  it('should save a user as a favorite', () => {
    const userService = { findById: jest.fn().mockReturnValueOnce('Fake user') };
    const favoriteService = { save: jest.fn() };
    const params = { userService, favoriteService };

    const wrapper = WrapperBuilder.buildWith(params);

    const buttonWrapper = wrapper.find('button');
    buttonWrapper.trigger('click');

    expect(favoriteService.save).toHaveBeenCalledTimes(1);
    expect(favoriteService.save).toHaveBeenCalledWith('Fake user');
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  it('should display a greeting message', () => {
    const data = () => ({ greetingMessage: 'Greetings' });

    const wrapper = WrapperBuilder.buildWith({ data });

    expect(wrapper.text()).toContain('Greetings');
  });
});
