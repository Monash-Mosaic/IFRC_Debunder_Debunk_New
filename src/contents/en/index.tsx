import EchoAvatar from "@/app/[locale]/chat/onboarding/_icons/echo-avatar";
import PaulaAvatar from "@/app/[locale]/chat/onboarding/_icons/paula-avatar";

// MCQ content imports
// import Mcq1Question from "./post/mcq-1-question.md";
// import Mcq1WhyCorrectTitle from "./post/mcq-1-why-correct-title.md";
// import Mcq1WhyCorrectContent from "./post/mcq-1-why-correct-content.md";
// import Mcq1WhyIncorrectTitle from "./post/mcq-1-why-incorrect-title.md";
// import Mcq1WhyIncorrectContent from "./post/mcq-1-why-incorrect-content.md";

import Mcq2Question from "./post/mcq-2-question.md";
import Mcq2WhyCorrectTitle from "./post/mcq-2-why-correct-title.md";
import Mcq2WhyCorrectContent from "./post/mcq-2-why-correct-content.md";
import Mcq2WhyIncorrectTitle from "./post/mcq-2-why-incorrect-title.md";
import Mcq2WhyIncorrectContent from "./post/mcq-2-why-incorrect-content.md";

import Mcq3Question from "./post/mcq-3-question.md";
import Mcq3WhyCorrectTitle from "./post/mcq-3-why-correct-title.md";
import Mcq3WhyCorrectContent from "./post/mcq-3-why-correct-content.md";
import Mcq3WhyIncorrectTitle from "./post/mcq-3-why-incorrect-title.md";
import Mcq3WhyIncorrectContent from "./post/mcq-3-why-incorrect-content.md";

// Post content imports
// import Content1Post from "./post/content-1-post.md";
// import Content2Post from "./post/content-2-post.md";
// import Content3Post from "./post/content-3-post.md";
// import Content4Post from "./post/content-4-post.md";
// import Content5Post from "./post/content-5-post.md";
import Content6Post from "./post/content-6-post.md";
import Content7Post from "./post/content-7-post.md";
import Content8Post from "./post/content-8-post.md";

// Explanation imports for content 1
// import Content1WhyCorrectTitle from "./post/content-1-why-correct-title.md";
// import Content1WhyCorrectContent from "./post/content-1-why-correct-content.md";
// import Content1WhyIncorrectTitle from "./post/content-1-why-incorrect-title.md";
// import Content1WhyIncorrectContent from "./post/content-1-why-incorrect-content.md";

// Explanation imports for content 2
// import Content2WhyCorrectTitle from "./post/content-2-why-correct-title.md";
// import Content2WhyCorrectContent from "./post/content-2-why-correct-content.md";
// import Content2WhyIncorrectTitle from "./post/content-2-why-incorrect-title.md";
// import Content2WhyIncorrectContent from "./post/content-2-why-incorrect-content.md";

// Explanation imports for content 3
// import Content3WhyCorrectTitle from "./post/content-3-why-correct-title.md";
// import Content3WhyCorrectContent from "./post/content-3-why-correct-content.md";
// import Content3WhyIncorrectTitle from "./post/content-3-why-incorrect-title.md";
// import Content3WhyIncorrectContent from "./post/content-3-why-incorrect-content.md";

// Explanation imports for content 4
// import Content4WhyCorrectTitle from "./post/content-4-why-correct-title.md";
// import Content4WhyCorrectContent from "./post/content-4-why-correct-content.md";
// import Content4WhyIncorrectTitle from "./post/content-4-why-incorrect-title.md";
// import Content4WhyIncorrectContent from "./post/content-4-why-incorrect-content.md";

// Explanation imports for content 5
// import Content5WhyCorrectTitle from "./post/content-5-why-correct-title.md";
// import Content5WhyCorrectContent from "./post/content-5-why-correct-content.md";
// import Content5WhyIncorrectTitle from "./post/content-5-why-incorrect-title.md";
// import Content5WhyIncorrectContent from "./post/content-5-why-incorrect-content.md";

// Explanation imports for content 6
import Content6WhyCorrectTitle from "./post/content-6-why-correct-title.md";
import Content6WhyCorrectContent from "./post/content-6-why-correct-content.md";
import Content6WhyIncorrectTitle from "./post/content-6-why-incorrect-title.md";
import Content6WhyIncorrectContent from "./post/content-6-why-incorrect-content.md";

// Explanation imports for content 7
import Content7WhyCorrectTitle from "./post/content-7-why-correct-title.md";
import Content7WhyCorrectContent from "./post/content-7-why-correct-content.md";
import Content7WhyIncorrectTitle from "./post/content-7-why-incorrect-title.md";
import Content7WhyIncorrectContent from "./post/content-7-why-incorrect-content.md";

// Explanation imports for content 8
import Content8WhyCorrectTitle from "./post/content-8-why-correct-title.md";
import Content8WhyCorrectContent from "./post/content-8-why-correct-content.md";
import Content8WhyIncorrectTitle from "./post/content-8-why-incorrect-title.md";
import Content8WhyIncorrectContent from "./post/content-8-why-incorrect-content.md";

export type User = {
  id: string;
  name: string;
  avatar: React.ReactNode;
  handle: string;
  isUser: boolean;
}

export type Post = {
  id: string;
  user: User;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export type ContentId = string;

export enum ContentType {
  LIKE_DISLIKE = 'like_dislike',
  SHARE = 'share',
  MCQ = 'mcq',
}

export enum InteractionMode {
  None = 'none',
  LikeReport = 'like-report',
}

export interface ContentBase {
  id: ContentId;
  type: ContentType;
}

export interface LikeDislikeContent extends ContentBase {
  type: ContentType.LIKE_DISLIKE;
  post: Post;
  correctAnswer: 'like' | 'dislike';
  whyCorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  whyIncorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
}

export interface MCQOption {
  id: string;
  label: string;
}

export interface MCQContent extends ContentBase {
  type: ContentType.MCQ;
  post: Post;
  options: MCQOption[];
  correctOptionId: string;
  whyCorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  whyIncorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
}

export interface ShareContent extends ContentBase {
  type: ContentType.SHARE;
  correctAnswer: 'share' | 'skip';
  whyCorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  whyIncorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
}

export type UserId = string;

export type Content = LikeDislikeContent | ShareContent | MCQContent;

export const users: Record<UserId, User> = {
  'paula': {
    id: 'paula',
    name: 'Paula',
    avatar: <PaulaAvatar />,
    handle: '@paula',
    isUser: false,
  },
  'echo': {
    id: 'echo',
    name: 'Echo',
    avatar: <EchoAvatar />,
    handle: '@echo',
    isUser: false,
  },
  'user': {
    id: 'user',
    name: 'You',
    avatar: null,
    handle: '@user',
    isUser: true,
  },
}


export const content: Record<ContentId, Content> = {
  // 'like-dislike-1': {
  //   id: 'like-dislike-1',
  //   type: ContentType.LIKE_DISLIKE,
  //   post: {
  //     id: 'like-dislike-1',
  //     user: users['echo'],
  //     content: <Content1Post />,
  //     mediaUrl: '/images/posts/post-1.jpg',
  //     mediaType: 'image',
  //   },
  //   correctAnswer: 'like',
  //   whyCorrectAnswer: {
  //     title: <Content1WhyCorrectTitle />,
  //     content: <Content1WhyCorrectContent />,
  //   },
  //   whyIncorrectAnswer: {
  //     title: <Content1WhyIncorrectTitle />,
  //     content: <Content1WhyIncorrectContent />,
  //   },
  // },
  // 'like-dislike-2': {
  //   id: 'like-dislike-2',
  //   type: ContentType.LIKE_DISLIKE,
  //   post: {
  //     id: 'like-dislike-2',
  //     user: users['echo'],
  //     content: <Content2Post />,
  //     mediaUrl: '/images/posts/post-2.jpg',
  //     mediaType: 'image',
  //   },
  //   correctAnswer: 'dislike',
  //   whyCorrectAnswer: {
  //     title: <Content2WhyCorrectTitle />,
  //     content: <Content2WhyCorrectContent />,
  //   },
  //   whyIncorrectAnswer: {
  //     title: <Content2WhyIncorrectTitle />,
  //     content: <Content2WhyIncorrectContent />,
  //   },
  // },
  // 'like-dislike-3': {
  //   id: 'like-dislike-3',
  //   type: ContentType.LIKE_DISLIKE,
  //   post: {
  //     id: 'like-dislike-3',
  //     user: users['echo'],
  //     content: <Content3Post />,
  //     mediaUrl: '/images/posts/post-3.jpg',
  //     mediaType: 'image',
  //   },
  //   correctAnswer: 'like',
  //   whyCorrectAnswer: {
  //     title: <Content3WhyCorrectTitle />,
  //     content: <Content3WhyCorrectContent />,
  //   },
  //   whyIncorrectAnswer: {
  //     title: <Content3WhyIncorrectTitle />,
  //     content: <Content3WhyIncorrectContent />,
  //   },
  // },
  // 'like-dislike-4': {
  //   id: 'like-dislike-4',
  //   type: ContentType.LIKE_DISLIKE,
  //   post: {
  //     id: 'like-dislike-4',
  //     user: users['echo'],
  //     content: <Content4Post />,
  //     mediaUrl: '/images/posts/post-4.jpg',
  //     mediaType: 'image',
  //   },
  //   correctAnswer: 'dislike',
  //   whyCorrectAnswer: {
  //     title: <Content4WhyCorrectTitle />,
  //     content: <Content4WhyCorrectContent />,
  //   },
  //   whyIncorrectAnswer: {
  //     title: <Content4WhyIncorrectTitle />,
  //     content: <Content4WhyIncorrectContent />,
  //   },
  // },
  // 'like-dislike-5': {
  //   id: 'like-dislike-5',
  //   type: ContentType.LIKE_DISLIKE,
  //   post: {
  //     id: 'like-dislike-5',
  //     user: users['echo'],
  //     content: <Content5Post />,
  //     mediaUrl: '/images/posts/post-5.jpg',
  //     mediaType: 'image',
  //   },
  //   correctAnswer: 'dislike',
  //   whyCorrectAnswer: {
  //     title: <Content5WhyCorrectTitle />,
  //     content: <Content5WhyCorrectContent />,
  //   },
  //   whyIncorrectAnswer: {
  //     title: <Content5WhyIncorrectTitle />,
  //     content: <Content5WhyIncorrectContent />,
  //   },
  // },
  // 'mcq-1': {
  //   id: 'mcq-1',
  //   type: ContentType.MCQ,
  //   post: {
  //     id: 'mcq-1',
  //     user: users['echo'],
  //     content: <Mcq1Question />,
  //   },
  //   options: [
  //     { id: 'a', label: "That's huge if true! Yes, let's share it, so people know!" },
  //     { id: 'b', label: 'Wait! Something seems off!' },
  //     { id: 'c', label: 'Wait! Something seems off about this post' },
  //     { id: 'd', label: 'Wait! I should fact-check this before sharing' },
  //   ],
  //   correctOptionId: 'b',
  //   whyCorrectAnswer: {
  //     title: <Mcq1WhyCorrectTitle />,
  //     content: <Mcq1WhyCorrectContent />,
  //   },
  //   whyIncorrectAnswer: {
  //     title: <Mcq1WhyIncorrectTitle />,
  //     content: <Mcq1WhyIncorrectContent />,
  //   },
  // },
  'mcq-2': {
    id: 'mcq-2',
    type: ContentType.MCQ,
    post: {
      id: 'mcq-2',
      user: users['echo'],
      content: <Mcq2Question />,
      mediaUrl: '/images/posts/ifrc/question-02.webp',
      mediaType: 'image',
    },
    options: [
      { id: 'a', label: "Because climate change is fake" },
      { id: 'b', label: 'Because all science is political' },
      { id: 'c', label: 'Because debate exists within a broad scientific consensus' },
      { id: 'd', label: 'Because no data exists' },
    ],
    correctOptionId: 'c',
    whyCorrectAnswer: {
      title: <Mcq2WhyCorrectTitle />,
      content: <Mcq2WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Mcq2WhyIncorrectTitle />,
      content: <Mcq2WhyIncorrectContent />,
    },
  },
  'like-dislike-6': {
    id: 'like-dislike-6',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: 'like-dislike-6',
      user: users['echo'],
      content: <Content6Post />,
      mediaUrl: '/images/posts/ifrc/question-03.webp',
      mediaType: 'image',
    },
    correctAnswer: 'dislike',
    whyCorrectAnswer: {
      title: <Content6WhyCorrectTitle />,
      content: <Content6WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content6WhyIncorrectTitle />,
      content: <Content6WhyIncorrectContent />,
    },
  },
  'like-dislike-7': {
    id: 'like-dislike-7',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: 'like-dislike-7',
      user: users['echo'],
      content: <Content7Post />,
      mediaUrl: '/images/posts/ifrc/question-05.webp',
      mediaType: 'image',
    },
    correctAnswer: 'dislike',
    whyCorrectAnswer: {
      title: <Content7WhyCorrectTitle />,
      content: <Content7WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content7WhyIncorrectTitle />,
      content: <Content7WhyIncorrectContent />,
    },
  },
  'mcq-3': {
    id: 'mcq-3',
    type: ContentType.MCQ,
    post: {
      id: 'mcq-3',
      user: users['echo'],
      content: <Mcq3Question />,
      mediaUrl: '/images/posts/ifrc/question-07.webp',
      mediaType: 'image',
    },
    options: [
      { id: 'a', label: "Share it because NASA is a trusted source" },
      { id: 'b', label: 'Check whether NASA actually published this figure and in what context' },
      { id: 'c', label: 'Reject it because sea level rise is exaggerated' },
      { id: 'd', label: 'Assume it applies equally to all coastal regions' },
    ],
    correctOptionId: 'b',
    whyCorrectAnswer: {
      title: <Mcq3WhyCorrectTitle />,
      content: <Mcq3WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Mcq3WhyIncorrectTitle />,
      content: <Mcq3WhyIncorrectContent />,
    },
  },
  'like-dislike-8': {
    id: 'like-dislike-8',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: 'like-dislike-8',
      user: users['echo'],
      content: <Content8Post />,
      mediaUrl: '/images/posts/ifrc/question-08.webp',
      mediaType: 'image',
    },
    correctAnswer: 'like',
    whyCorrectAnswer: {
      title: <Content8WhyCorrectTitle />,
      content: <Content8WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content8WhyIncorrectTitle />,
      content: <Content8WhyIncorrectContent />,
    },
  },
}

export const contentList = Object.values(content);
