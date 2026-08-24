"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { cn } from "@/shared/utils";
import blurBg from "@/assets/empty/blurbg.png";
import emptyCharacter from "@/assets/empty/character.png";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

type EmptyStateVariant = "default" | "compact";

interface EmptyStateProps {
  title: string;
  description?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  variant?: EmptyStateVariant;
  showBackground?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "default",
  showBackground = false,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        variant === "default"
          ? "absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden px-5 py-10 text-center"
          : "absolute inset-0 flex h-full w-full flex-col items-center justify-center px-5 text-center",
        className,
      )}
    >
      {variant === "default" && showBackground && (
        <Image
          src={blurBg}
          alt=""
          fill
          priority
          aria-hidden
          className="pointer-events-none object-cover"
        />
      )}

      <div
        className={cn(
          "relative z-10 flex w-full flex-col items-center gap-3",
          variant === "default" ? "mt-5" : "mt-0",
        )}
      >
        {variant === "default" && (
          <div className="relative flex h-full w-45 items-end justify-center">
            {/* 캐릭터 뒤 블러 */}
            {!showBackground && (
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-10 left-1/2 z-0 h-[50px] w-[200px] -translate-x-1/2 rounded-full bg-main-blue/50 blur-3xl"
              />
            )}

            {/* 캐릭터 */}
            <div className="absolute bottom-3 z-20 h-[180px] w-full overflow-hidden">
              {" "}
              <motion.div
                className="absolute inset-x-0 bottom-0 flex justify-center"
                initial={{ y: 100 }}
                animate={{
                  y: [100, 50, 50, 100, 100, 17, 17, 100, 100],
                }}
                transition={{
                  duration: 10,
                  times: [0, 0.1, 0.18, 0.28, 0.3, 0.48, 0.85, 0.99, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="relative w-[154px]">
                  <Image
                    src={emptyCharacter}
                    alt="빈 상태 캐릭터"
                    width={154}
                    priority
                    className="block h-auto w-full"
                  />
                  {/* 왼쪽 눈동자 */}
                  <motion.span
                    className="absolute left-[40%] top-[65%] size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-system-black"
                    animate={{
                      x: [0, 0, -4, 4, -4, 4, 0, 0],
                      y: [
                        -4, -4, -4, -4, -4, -4, -4, -4, -8, -8, -8, -8, -8, -8, -8, -8, 0, 0, 0, 0,
                        0, 0, 0, 0,
                      ],
                    }}
                    transition={{
                      x: {
                        duration: 10,
                        times: [0, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 1],
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      y: {
                        duration: 30,
                        times: [
                          0, 0.033, 0.067, 0.1, 0.133, 0.167, 0.2, 0.333, 0.334, 0.367, 0.4, 0.433,
                          0.467, 0.5, 0.533, 0.666, 0.667, 0.7, 0.733, 0.767, 0.8, 0.833, 0.867, 1,
                        ],
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  />
                  {/* 오른쪽 눈동자 */}
                  <motion.span
                    className="absolute left-[60%] top-[65%] size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-system-black"
                    animate={{
                      x: [0, 0, -4, 4, -4, 4, 0, 0],
                      y: [
                        -4, -4, -4, -4, -4, -4, -4, -4, -8, -8, -8, -8, -8, -8, -8, -8, 0, 0, 0, 0,
                        0, 0, 0, 0,
                      ],
                    }}
                    transition={{
                      x: {
                        duration: 10,
                        times: [0, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 1],
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      y: {
                        duration: 30,
                        times: [
                          0, 0.033, 0.067, 0.1, 0.133, 0.167, 0.2, 0.333, 0.334, 0.367, 0.4, 0.433,
                          0.467, 0.5, 0.533, 0.666, 0.667, 0.7, 0.733, 0.767, 0.8, 0.833, 0.867, 1,
                        ],
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  />
                </div>
              </motion.div>
            </div>
            {/* 홀 */}
            <div className="relative z-10 h-[24px] w-[190px] rounded-[50%] bg-system-blackbg/40" />
            {/* 손 */}
            <motion.div
              className="pointer-events-none absolute bottom-1 z-30 flex w-[150px] justify-between px-[8px]"
              animate={{
                opacity: [0, 0, 0, 1, 1, 0, 0],
              }}
              transition={{
                duration: 10,
                times: [0, 0.2, 0.35, 0.351, 0.97, 0.971, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="size-[22px] rounded-full bg-empty-hands" />
              <span className="size-[22px] rounded-full bg-empty-hands" />
            </motion.div>
            {/* 멘트 */}
            <motion.p
              className="absolute bottom-21 z-30 font-ssurround text-sm font-bold tracking-[0.08em] text-text-heading"
              animate={{
                opacity: [0, 0, 1, 1, 0, 0],
              }}
              transition={{
                duration: 10,
                times: [0, 0.09, 0.1, 0.2, 0.21, 1],
                repeat: Infinity,
                ease: "linear",
              }}
            >
              HMM...
            </motion.p>
            <motion.p
              className="absolute bottom-21 z-30 font-ssurround text-sm font-bold tracking-[0.08em] text-text-heading"
              animate={{
                opacity: [0, 0, 1, 1, 0, 0],
              }}
              transition={{
                duration: 10,
                times: [0, 0.7, 0.71, 0.98, 0.99, 1],
                repeat: Infinity,
                ease: "linear",
              }}
            >
              NOTHING...
            </motion.p>
          </div>
        )}

        <div className={cn("flex flex-col items-center gap-2", variant === "default" && "mt-3")}>
          <p
            className={cn(
              "font-ssurround font-bold text-text-heading",
              variant === "default" ? "text-lg" : "text-md",
            )}
          >
            {title}
          </p>

          {description && (
            <p
              className={cn(
                "leading-relaxed font-medium text-sub-deepgray",
                variant === "default" ? "text-md" : "text-sm",
              )}
            >
              {description}
            </p>
          )}
        </div>

        {(primaryAction || secondaryAction) && (
          <div className={cn("flex w-full gap-2", variant === "default" ? "mt-2" : "")}>
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}

            {primaryAction && (
              <Button variant="primary" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
