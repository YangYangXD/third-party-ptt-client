import type { GetStaticProps, NextPage } from "next";
import PTT, { HotBoard } from "../../../core/PTT";
import { cn } from "../../../utils/cn";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/@/components/ui/tabs";
import { Card, CardContent } from "../../../components/@/components/ui/card";
import Link from "next/link";
import useScroll from "../../../hooks/useScroll";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useScrollMemo from "../../../hooks/useScrollMemo";
import { wrapper } from "../../../redux/store";
import { getHotBoards } from "../../../redux/actions/getHotBoards.act";

const forumsType = [
  { name: "熱門看板", href: "/forum/hot" },
  { name: "分類看板", href: "/forum/group/1" },
];

type Props = {
  forums: HotBoard[];
};

const Page: NextPage<Props> = (props: Props) => {
  const router = useRouter();

  const pageRef = useRef(null);
  const [pageEl, setPageEl] = useState(pageRef.current);
  const [isTabListHidden, setTabListHiddden] = useState(false);

  useEffect(() => {
    setPageEl(pageRef.current);
  }, [pageRef.current]);

  useScroll(
    pageEl,
    () => {
      setTabListHiddden(false);
    },
    () => {
      setTabListHiddden(true);
    }
  );

  const scrollTop = useScrollMemo(pageEl as unknown as Element);

  return (
    <div
      ref={pageRef}
      className={cn("w-screen h-[calc(100vh-96px)] overflow-y-scroll")}
    >
      <Tabs defaultValue={forumsType[0].name} className={cn("w-full")}>
        <TabsList
          className={cn(
            "w-full rounded-none",
            "sticky",
            isTabListHidden ? "top-0" : "top-[-40px]",
            "transition-all"
          )}
        >
          {forumsType.map((forumType) => (
            <TabsTrigger
              key={forumType.name}
              value={forumType.name}
              className="w-full"
              onClick={() => {
                router.push(forumType.href);
              }}
            >
              {forumType.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {forumsType.map((forumType) => {
          if (forumType.name === "熱門看板") {
            return (
              <TabsContent
                key={forumType.name}
                value={forumType.name}
                className="mt-0"
              >
                {props.forums.map((forum) => (
                  <Link key={forum.boardName} href={forum.boardHref}>
                    <Card className="rounded-none">
                      <CardContent
                        className={cn(
                          "bg-primary",
                          "flex flex-col justify-between",
                          "p-2"
                        )}
                      >
                        <div className="flex justify-between">
                          <div className="flex">
                            <h3>{forum.boardClass}</h3>・
                            <h3>{forum.boardName}</h3>
                          </div>
                          <div>
                            <h3
                              className={cn(
                                forum.boardLevel === 1 ? "text-cyan-400" : "",
                                forum.boardLevel === 2 ? "text-blue-400" : "",
                                forum.boardLevel === 3 ? "text-red-400" : "",
                                forum.boardLevel === 4 ? "text-text1" : "",
                                forum.boardLevel === 5 ? "text-yellow-400" : ""
                              )}
                            >
                              {forum.boardRate}
                            </h3>
                          </div>
                        </div>
                        <div className="text-text2 text-sm">
                          {forum.boardTitle}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </TabsContent>
            );
          }
        })}
      </Tabs>
    </div>
  );
};

export const getStaticProps: GetStaticProps = wrapper.getStaticProps(
  (store) => async () => {
    let forums = store.getState().setHotBoards;
    if (forums.length === 0) {
      await store.dispatch(getHotBoards);
      forums = store.getState().setHotBoards;
    }
    return {
      props: {
        forums,
        revalidate: 3,
      },
    };
  }
);

export default Page;
