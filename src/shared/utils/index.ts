import axios, { CreateAxiosDefaults } from 'axios';
import * as _ from 'lodash';
import moment from 'moment';
export class Util {
  static insertToArray<T>(arr: T[], index: number, ...newItems: T[]) {
    return [...arr.slice(0, index), ...newItems, ...arr.slice(index)];
  }

  static parseMessageWithInfo<T>(params: { message: string; info: T }) {
    let { message } = params;
    const { info } = params;
    const regex = /({|})/g;
    const regex2 = /({{\w+}})|({{\w+(?:\.\w+)+)}}/g;
    if (regex.test(message)) {
      const replaceText: RegExpMatchArray | null = message.match(regex2);
      if (replaceText) {
        for (let item of replaceText) {
          item = item.replace(regex, '');
          message = message.replace(item, _.get(info, item));
        }
        message = message.replace(regex, '');
      }
    }
    return message;
  }

  static convertViToEng(string: string) {
    const obj = {
      Đ: 'D',
      đ: 'd',
      â: 'a',
      ă: 'a',
      ê: 'e',
      ô: 'o',
      ơ: 'o',
      ư: 'u',
      á: 'a',
      à: 'a',
      ạ: 'a',
      ả: 'a',
      ã: 'a',
      ắ: 'a',
      ằ: 'a',
      ặ: 'a',
      ẳ: 'a',
      ẵ: 'a',
      ấ: 'a',
      ầ: 'a',
      ậ: 'a',
      ẩ: 'a',
      ẫ: 'a',
      é: 'e',
      è: 'e',
      ẻ: 'e',
      ẽ: 'e',
      ẹ: 'e',
      ế: 'e',
      ề: 'e',
      ể: 'e',
      ễ: 'e',
      ệ: 'e',
      ý: 'y',
      ỳ: 'y',
      ỵ: 'y',
      ỷ: 'y',
      ỹ: 'y',
      ú: 'u',
      ù: 'u',
      ủ: 'u',
      ũ: 'u',
      ụ: 'u',
      ứ: 'u',
      ừ: 'u',
      ử: 'u',
      ữ: 'u',
      ự: 'u',
      í: 'i',
      ì: 'i',
      ị: 'i',
      ỉ: 'i',
      ĩ: 'i',
      ó: 'o',
      ò: 'o',
      ỏ: 'o',
      õ: 'o',
      ọ: 'o',
      ố: 'o',
      ồ: 'o',
      ổ: 'o',
      ỗ: 'o',
      ộ: 'o',
      ớ: 'o',
      ờ: 'o',
      ở: 'o',
      ỡ: 'o',
      ợ: 'o',
    };

    string = string.trim();
    string = string.toLowerCase();

    const arr: string[] = string.split('');

    for (const i in arr) {
      const arri = arr[i];
      if (!arri) continue;
      const value = _.get(obj, arri);
      if (value) {
        arr[i] = value;
      }
    }

    return arr.join('');
  }

  static changeToSlug(title: string, prefix: string): string {
    const from =
      'áàảạãăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗơớờởỡợúùủũụưứừửữựýỳỷỹỵđ';
    const to =
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyd';

    let slug = title.toLowerCase();

    // Replace accented chars, dùng Array.from để index an toàn
    const fromArr = Array.from(from);
    for (let i = 0; i < fromArr.length; i++) {
      slug = slug.replace(new RegExp(fromArr[i]!, 'g'), to[i]!);
    }

    slug = slug
      .replace(/[^a-z0-9\s-]/g, '') // remove special
      .replace(/\s+/g, '-') // whitespace -> -
      .replace(/-+/g, '-') // collapse -
      .replace(/^-+|-+$/g, ''); // trim

    return `${slug}-${prefix}`;
  }

  convertViToEngSlug(string: string) {
    const obj = {
      Đ: 'D',
      đ: 'd',
      â: 'a',
      ă: 'a',
      ê: 'e',
      ô: 'o',
      ơ: 'o',
      ư: 'u',
      á: 'a',
      à: 'a',
      ạ: 'a',
      ả: 'a',
      ã: 'a',
      ắ: 'a',
      ằ: 'a',
      ặ: 'a',
      ẳ: 'a',
      ẵ: 'a',
      ấ: 'a',
      ầ: 'a',
      ậ: 'a',
      ẩ: 'a',
      ẫ: 'a',
      é: 'e',
      è: 'e',
      ẻ: 'e',
      ẽ: 'e',
      ẹ: 'e',
      ế: 'e',
      ề: 'e',
      ể: 'e',
      ễ: 'e',
      ệ: 'e',
      ý: 'y',
      ỳ: 'y',
      ỵ: 'y',
      ỷ: 'y',
      ỹ: 'y',
      ú: 'u',
      ù: 'u',
      ủ: 'u',
      ũ: 'u',
      ụ: 'u',
      ứ: 'u',
      ừ: 'u',
      ử: 'u',
      ữ: 'u',
      ự: 'u',
      í: 'i',
      ì: 'i',
      ị: 'i',
      ỉ: 'i',
      ĩ: 'i',
      ó: 'o',
      ò: 'o',
      ỏ: 'o',
      õ: 'o',
      ọ: 'o',
      ố: 'o',
      ồ: 'o',
      ổ: 'o',
      ỗ: 'o',
      ộ: 'o',
      ớ: 'o',
      ờ: 'o',
      ở: 'o',
      ỡ: 'o',
      ợ: 'o',
    };

    string = string.trim();
    string = string.toLowerCase();

    const arr = string.split('');

    for (const i in arr) {
      const arri = arr[i];
      if (!arri) continue;
      const value = _.get(obj, arri);
      if (value) {
        arr[i] = value;
      }
    }

    let slug = arr.join('');
    slug = slug.replace(/ /g, '-');
    // slug = slug.replace(/[^a-zA-Z0-9]/g, '');
    return slug.replace(/[^a-zA-Z0-9\-]/g, '');
  }

  static validateEmail(email: string): boolean {
    // Dùng regex đơn giản nhưng vẫn phù hợp hầu hết trường hợp:
    // - [^\s@]+: 1+ ký tự không phải whitespace và không phải @
    // - @
    // - [^\s@]+: 1+ ký tự không phải whitespace và không phải @
    // - \.
    // - [^\s@]{2,}: ít nhất 2 ký tự không phải whitespace và không phải @
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(email.toLowerCase());
  }

  static revokeFileName(
    oldFileName: string,
    addTime: boolean = true,
    resizeOptions?: { height: number; width: number },
  ) {
    const index = oldFileName.lastIndexOf('.');
    const newFileName = `${oldFileName.substring(0, index)}${
      addTime ? `-${moment().valueOf()}` : ''
    }`;
    if (resizeOptions?.height || resizeOptions?.width) {
      return `${newFileName}-${resizeOptions.width}x${
        resizeOptions.height
      }${oldFileName.substring(index)}`;
    }
    return `${newFileName}${oldFileName.substring(index)}`;
  }
  static makeContent(content: string, values: object) {
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        const value = _.get(values, key);
        const re = new RegExp(`\\[${key}\\]`, 'g');
        content = content.replace(re, value);
      }
    }
    return content;
  }
  static snakeCaseToCamelCase(string: string) {
    return string
      .toLowerCase()
      .replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', ''),
      );
  }

  static camelCaseToSnakeCase(string: string) {
    const result = string.replace(/([A-Z])/g, ' $1');
    return result
      .split(' ')
      .filter((item) => !!item.trim())
      .join('_')
      .toLowerCase();
  }

  static camelize(string: string) {
    return string
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  static capitalize(string: string) {
    return string[0]?.toUpperCase() + string.slice(1);
  }

  static generateUUIDV4() {
    // Public Domain/MIT
    let d = new Date().getTime(); //Timestamp
    let d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        let r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
  }

  static fetch<T>(
    baseURL: string,
    configAxios: CreateAxiosDefaults<T> = {
      timeout: 1000,
    },
  ) {
    configAxios.baseURL = baseURL;
    return axios.create(configAxios);
  }

  static timeToMinutes(time: string) {
    const [hours, minutes] = time.split(':');

    return (
      parseInt(hours ? hours : '0', 10) * 60 +
      parseInt(minutes ? minutes : '0', 10)
    );
  }

  static checkOverlap(
    startA: number,
    endA: number,
    startB: number,
    endB: number,
  ) {
    return endA > startB && endB > startA;
  }

  static exclude<T, Key extends keyof T>(object: T, keys: Key[]): Omit<T, Key> {
    for (const key of keys) {
      delete object[key];
    }
    return object;
  }
  static generateTransactionCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 5;
    let transactionCode = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      transactionCode += characters.charAt(randomIndex);
    }

    return transactionCode + moment().format('DDMMYYYYhhmmssSSS');
  }
}
