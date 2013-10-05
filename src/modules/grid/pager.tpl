<% console.log(obj); %>
<div class="btn-toolbar">
  <div class="btn-group btn-group-xs navbar-left grid-nav">
    <button class="btn btn-first" type="button" <% if (!canGotoFirst) { %>disabled<% } %>><i class="icon-fast-backward"></i></button>
    <button class="btn btn-prev" type="button" <% if (!canGotoPrev)  { %>disabled<% } %>><i class="icon-step-backward"></i></button>
    <button class="btn btn-next" type="button" <% if (!canGotoNext)  { %>disabled<% } %>><i class="icon-step-forward"></i></button>
    <button class="btn btn-last" type="button" <% if (!canGotoLast)  { %>disabled<% } %>><i class="icon-fast-forward"></i></button>
  </div>
  <div class="navbar-left" style="padding-left: 0.5em;">
    <% if (pagingInfo.pageSize == 0) { %>
      Showing all <%= pagingInfo.totalRows %> rows
    <% } else { %>
      Showing page <%= pagingInfo.pageNum + 1 %> of <%= pagingInfo.totalPages %>
    <% } %>
  </div>
  <div class="btn-group btn-group-xs navbar-right">
    <button class="btn btn-pagesize" type="button" <% if (pagingInfo.pageSize == 0  ) { %>disabled<% } %> data="0"  >All</button>
    <button class="btn btn-pagesize" type="button" <% if (pagingInfo.pageSize == -1 ) { %>disabled<% } %> data="-1" >Auto</button>
    <button class="btn btn-pagesize" type="button" <% if (pagingInfo.pageSize == 10 ) { %>disabled<% } %> data="10" >10</button>
    <button class="btn btn-pagesize" type="button" <% if (pagingInfo.pageSize == 25 ) { %>disabled<% } %> data="25" >25</button>
    <button class="btn btn-pagesize" type="button" <% if (pagingInfo.pageSize == 50 ) { %>disabled<% } %> data="50" >50</button>
    <button class="btn btn-pagesize" type="button" <% if (pagingInfo.pageSize == 100) { %>disabled<% } %> data="100">100</button>
  </div>
</div>
