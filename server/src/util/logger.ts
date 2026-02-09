import CONFIG from "@akc/config";
import Chalk, { ChalkInstance } from "chalk";

const logColor = (color: ChalkInstance, header: string, ...args: unknown[]) => console.log(color(header), ...args);

enum LogLevel {
  SILLY = 10,
  TRACE = 20,
  DEBUG = 30,
  INFO = 40,
  WARN = 50,
  ERROR = 60,
  FATAL = 70,
}

const ChalkTemplates = {
  [LogLevel.SILLY]: Chalk.magentaBright.dim,
  [LogLevel.TRACE]: Chalk.greenBright,
  [LogLevel.DEBUG]: Chalk.magenta,
  [LogLevel.INFO]: Chalk.blueBright,
  [LogLevel.WARN]: Chalk.yellow,
  [LogLevel.ERROR]: Chalk.redBright,
  [LogLevel.FATAL]: Chalk.redBright.underline.bold.dim,
} as const;

const LEVELS = Object.keys(LogLevel).filter((level) => isNaN(parseInt(level))) as Array<keyof typeof LogLevel>;

export class LOG {
  /**
   * Print the messages that will be logged using the current logLevel envar
   */
  public static verbosityPrint() {
    const visible = LEVELS.filter((l) => LogLevel[l] >= CONFIG.LOG_LEVEL);
    const colored = visible.map((l) => ChalkTemplates[LogLevel[l]](LogLevel[l] === CONFIG.LOG_LEVEL ? `[${l}]` : l));
    const verbosityMessage = `Logging: ${colored.join(" | ")}`;
    const verbosityLine = "-".repeat(visible.join(" | ").length + 11); // 11 Is the length of 'Logging: ' and the missing ' |'
    logColor(Chalk.whiteBright, verbosityLine);
    logColor(Chalk.whiteBright, verbosityMessage);
    logColor(Chalk.whiteBright, verbosityLine);
  }
  /**
   * Function to print all of the log levels for a demo of the style
   */
  public static _levelPrint() {
    for (const level of LEVELS) logColor(ChalkTemplates[LogLevel[level]], level, LogLevel[level]);
  }

  /**
   * This function will use a log level and an optional tag
   * If the loglevel is lower than debug (trace or silly) it will also print the stack trace
   */
  private static log(logLevel: keyof typeof LogLevel, tag: string | undefined, ...args: unknown[]) {
    if (CONFIG.LOG_LEVEL > LogLevel[logLevel]) return;
    if (args.length === 1 && typeof args[0] === "object") args[0] = `\n${JSON.stringify(args[0], null, 4)}`;
    const stack = LogLevel[logLevel] < LogLevel.DEBUG ? new Error("Stack Trace").stack : undefined;
    if (!!stack) args.push(`\n${stack.split("\n").slice(3).join("\n")}`);
    logColor(ChalkTemplates[LogLevel[logLevel]], `[${tag ?? logLevel}]`.toUpperCase(), ...args);
  }

  // Tagged Logs, Ex: [CRYPTO] My Log
  public static sillyTag = (tag: string, ...args: unknown[]) => this.log("SILLY", tag, ...args);
  public static traceTag = (tag: string, ...args: unknown[]) => this.log("TRACE", tag, ...args);
  public static debugTag = (tag: string, ...args: unknown[]) => this.log("DEBUG", tag, ...args);
  public static infoTag = (tag: string, ...args: unknown[]) => this.log("INFO", tag, ...args);
  public static warnTag = (tag: string, ...args: unknown[]) => this.log("WARN", tag, ...args);
  public static errorTag = (tag: string, ...args: unknown[]) => this.log("ERROR", tag, ...args);
  public static fatalTag = (tag: string, ...args: unknown[]) => this.log("FATAL", tag, ...args);

  // Untagged Logs, Ex: [SILLY] My Log
  public static silly = (...args: unknown[]) => this.log("SILLY", undefined, ...args);
  public static trace = (...args: unknown[]) => this.log("TRACE", undefined, ...args);
  public static debug = (...args: unknown[]) => this.log("DEBUG", undefined, ...args);
  public static info = (...args: unknown[]) => this.log("INFO", undefined, ...args);
  public static warn = (...args: unknown[]) => this.log("WARN", undefined, ...args);
  public static error = (...args: unknown[]) => this.log("ERROR", undefined, ...args);
  public static fatal = (...args: unknown[]) => this.log("FATAL", undefined, ...args);
}
