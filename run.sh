#!/bin/bash

# Doc2PDF 快速启动脚本

echo "🚀 Doc2PDF - 文档网站转 PDF 工具"
echo ""

# 检查参数
if [ -z "$1" ]; then
  echo "用法: ./run.sh <url> [output-path]"
  echo ""
  echo "示例:"
  echo "  ./run.sh https://docs.example.com"
  echo "  ./run.sh https://docs.example.com ./my-docs.pdf"
  echo ""
  exit 1
fi

URL=$1
OUTPUT=${2:-"./output/docs.pdf"}

echo "📄 URL: $URL"
echo "💾 输出: $OUTPUT"
echo ""

# 运行程序
node src/index.js "$URL" -o "$OUTPUT"
