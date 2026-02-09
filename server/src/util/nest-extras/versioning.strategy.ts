import { Request } from "express";
import { Version, VersioningOptions, VersioningType } from "@nestjs/common";
import { ApiHeaders, ApiVersions } from "@atlas/enums";

/**
 *  Default API version decorator, used to mark a route as version indifferent.
 *  Routes should rarely be marked by this
 */
const DEFAULT_API_VERSION = "DEFAULT" as const;
/**
 * This Array contains the values of the ApiVersions enum and also the DEFAULT ApiVersion
 *
 * This is used locally to provide the DEFAULT route if no other versions match
 * but a version indifferent route has been provided
 */
const API_VERSION_ARRAY = [...Object.values(ApiVersions).sort((a, b) => b.localeCompare(a)), DEFAULT_API_VERSION];

/**
 * Api Version Decorator
 * @param version ApiVersion to mark a route with
 * @returns NestJS Decorator that marks a function with a specific ApiVersion
 */
export const ApiVersion = (version: ApiVersions) => Version(version);

/**
 * Default Api Version Decorator
 * @returns NestJS Decorator that marks a function with the DEFAULT ApiVersion
 * @see HeaderDateVersionStrategy
 */
export const DefaultApiVersion = () => Version(DEFAULT_API_VERSION);

/**
 * Versioning Strategy that uses headers to always pull the newest date of the API
 * unless a specific version is requested.
 *
 * Faulty versions will default to newest available version on a route, then a
 * DEFAULT route where marked, or they will 404
 */
export class HeaderDateVersionStrategy {
  /**
   * The logic is that we will attempt to match with the requested value,
   * otherwise we'll return the newest endpoint
   * @param request Express Request, unsafely casted
   * @returns The matched version string or the array of all possible versions
   */
  private static extractVersionFromRequest(request: unknown): string | string[] {
    const headerVersionString = (request as Request).headers[ApiHeaders.ApiVersion] as ApiVersions | undefined;
    if (!headerVersionString || typeof headerVersionString !== "string") return API_VERSION_ARRAY;
    if (Object.values(ApiVersions).includes(headerVersionString)) return headerVersionString;
    return API_VERSION_ARRAY;
  }

  public static versioning(): VersioningOptions {
    return {
      type: VersioningType.CUSTOM,
      extractor: HeaderDateVersionStrategy.extractVersionFromRequest,
    };
  }
}
