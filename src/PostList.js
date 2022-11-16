import { request } from "./Api.js";
import { setItem, getItem } from "./Storage.js";
import { push } from "./router.js";

export default function PostList({
  $target,
  initialState,
  postAdd,
  postDelete,
}) {
  const $postList = document.createElement("div");
  $postList.className = "postList";

  // CSS
  $postList.style = `   
   overflow: auto;   
   white-space: nowrap;
   height: 98vh;
   backgroundColor: #c8c8c8;   
  `;

  this.state = initialState;

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  // 접혀있는지 펴져있는지 확인하는 함수.
  this.visible = (id) => {
    let visible = getItem(id, {
      id: id,
      visible: null,
    });

    // 처음에 값 세팅해준다.
    if (visible.visible === null) {
      setItem(id, {
        id: id,
        visible: "none",
      });
    }

    visible = getItem(id);

    return visible.visible;
  };

  // 재귀적
  let selectedPostId = null; // 현재 선택된 문서의 id
  this.makeList = (docList, depth = 0) => {
    return docList
      .map(
        (cur) =>
          `<li class="title" data-id="${cur.id}" title="${
            cur.title
          }" style="list-style:none; background-color:initial;">            
            <p class="title" style="margin:0; display:inline-block; background-color:${
              cur.id === selectedPostId ? `green;` : `transparent;`
            }">${this.visible(cur.id) === "none" ? "▶" : "▼"}${cur.title}</p>
            <button class="add" style="position:sticky; right:25px;">+</button>
            <button class="delete" style="position:sticky; right:1px;">x</button>          
            ${
              cur.documents.length > 0
                ? `<ul style="display:${this.visible(cur.id)};">${this.makeList(
                    cur.documents,
                    depth + 1
                  )}</ul>`
                : ""
            }          
          </li>`
      )
      .join("");
  };

  $postList.addEventListener("click", (e) => {
    const { target } = e;
    const $li = target.closest("li");

    if (!$li) return;

    const { id } = $li.dataset;
    const name = target.className;

    if (name === "title") {
      selectedPostId = +id;
      console.log(typeof selectedPostId);
      push(`/posts/${id}`);

      const $ul = $li.childNodes[7];

      if (!$ul) {
        setItem(id, {
          id: id,
          visible: "none",
        });
        return;
      }

      // localStorage를 사용해서 하위목록들이 보여질지 아닐지 결정.
      if ($ul.style.display === "") {
        $ul.style.display = "none";

        setItem(id, {
          id: id,
          visible: "none",
        });
      } else {
        $ul.style.display = "";

        setItem(id, {
          id: id,
          visible: "",
        });
      }
    } else if (name === "add") {
      postAdd(id);
      fetchPosts();
    } else if (name === "delete") {
      postDelete(id);
      //fetchPosts(); PostPage에 postDelete를 정의한 부분에 넣어버림. 왜 여기에 있으면 반영이 바로 안될까
    }
  });

  $postList.addEventListener("mouseover", (e) => {
    const { target } = e;

    const $li = target.closest("li");

    if (!$li) return;

    $li.style.backgroundColor = "#bebebe";
  });

  $postList.addEventListener("mouseout", (e) => {
    const { target } = e;

    const $li = target.closest("li");

    if (!$li) return;

    $li.style.backgroundColor = "";
  });

  const fetchPosts = async () => {
    const nextState = await request("documents", {
      method: "GET",
    });
    this.setState(nextState);
  };

  this.render = () => {
    $postList.innerHTML = `
      <ul>
      ${this.makeList(this.state)}     
      </ul>
    `;
  };

  $target.appendChild($postList);
}
