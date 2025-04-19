import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { TraceId } from '../decorators/trace-id.decorator';

@Injectable()
export class CommonApiHelper {
  constructor(private readonly httpService: HttpService) {}

  public async getData<T>(properties: any, body: any): Promise<T> {
    if (properties.method === 'POST') {
      return this.postData(properties, body);
    }
    if (properties.method === 'GET') {
      return this.fetchData(properties, body);
    }
    if (properties.method === 'PUT') {
      return this.putData(properties, body);
    }
    if (properties.method === 'PATCH') {
      return this.patchData(properties, body);
    }
    throw new Error('Method not implemented.');
  }

  @TraceId()
  public async fetchData<T>(options: any, params: any): Promise<T> {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    const queryString = await this.buildQueryString(params);
    let url = '';
    if (queryString) {
      url = endpoint + '?' + queryString;
    } else {
      url = endpoint;
    }
    Logger.log(`requesting resource from GET url : ${url}`);
    const { data } = await lastValueFrom(
      this.httpService.get<T>(url, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in GET url: ${endpoint} ${err}`);
          throw new HttpException(
            err?.response?.data || "Something Went Wrong.",
            err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    return data;
  }

  @TraceId()
  public async postData<T>(options: any, body: any) {
    const config: AxiosRequestConfig = options.config ? options.config : {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from POST url : ${endpoint}`);
    const { data, headers } = await lastValueFrom(
      this.httpService.post<T>(endpoint, body, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in POST url: ${endpoint}`, {
            data: err?.response?.data,
          });
          throw new HttpException(
            err?.response?.data || "Something Went Wrong.",
            err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    if (options?.resHeaders) {
      data.headers = headers;
    }
    return data;
  }

  @TraceId()
  public async putData<T>(options: any, body: any): Promise<T> {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from PUT url : ${endpoint}`);
    const { data } = await lastValueFrom(
      this.httpService.put<T>(endpoint, body, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in PUT url: ${endpoint} ${err}`);
          throw new HttpException(
            err?.response?.data || "Something Went Wrong.",
            err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    return data;
  }

  @TraceId()
  public async patchData<T>(options: any, body: any): Promise<T> {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from PUT url : ${endpoint}`);
    const { data } = await lastValueFrom(
      this.httpService.patch<T>(endpoint, body, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in PUT url: ${endpoint} ${err}`);
          throw new HttpException(
            err?.response?.data || "Something Went Wrong.",
            err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    return data;
  }

  @TraceId()
  public async deleteData<T>(options: any, body: any): Promise<T> {
    const config = options.config ?? {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from DELETE url : ${endpoint}`);
    const { data } = await lastValueFrom(
      this.httpService.delete<T>(endpoint, { ...config, data: body }).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in DELETE url: ${endpoint} ${err}`);
          throw new HttpException(
            err?.response?.data || "Something Went Wrong.",
            err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    return data;
  }

  public async buildQueryString(parameters: object) {
    return Object.keys(parameters)
      .map((key) => key + '=' + parameters[key])
      .join('&');
  }
}
